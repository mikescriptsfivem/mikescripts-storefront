/**
 * Tebex descriptions are often written with Markdown typed into the rich-text editor, e.g.
 * <p>## Towing</p><p>- **Wheel-lift**: …</p><p>| Key | Action |</p>. Shown as-is, the symbols appear literally.
 * This converts those patterns into real headings, lists, tables, bold/italic/code and links.
 *
 * Input must already be sanitised (see sanitize.ts). Nodes are only moved or created with DOM APIs and text is
 * never parsed as HTML, so the output is as safe as the input.
 */

type LineKind = 'empty' | 'heading' | 'ul' | 'ol' | 'row' | 'separator' | 'text'

interface Line {
  kind: LineKind
  level: number
  nodes: Node[]
  /** Index of the source paragraph, so text lines from one paragraph stay together. */
  group: number
}

type Item = { line: Line } | { element: Node }

const TEXT_NODE = 3
const SHOW_TEXT = 4
const SKIP_INLINE = new Set(['CODE', 'PRE', 'A', 'KBD', 'SAMP'])
const INLINE = /\*\*([^*]+?)\*\*|`([^`\n]+?)`|(https?:\/\/[^\s<>"'`]+)|(?<![\w*])\*([^*\s][^*\n]*?)\*(?![\w*])/g

function lineText(nodes: Node[]): string {
  return nodes
    .map((node) => node.textContent ?? '')
    .join('')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function classify(text: string): { kind: LineKind; level: number } {
  if (!text) return { kind: 'empty', level: 0 }
  const heading = /^(#{1,6})\s+\S/.exec(text)
  if (heading?.[1]) return { kind: 'heading', level: heading[1].length }
  if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(text)) return { kind: 'separator', level: 0 }
  if (/^\|.*\|$/.test(text)) return { kind: 'row', level: 0 }
  if (/^[-*•]\s+\S/.test(text)) return { kind: 'ul', level: 0 }
  if (/^\d+[.)]\s+\S/.test(text)) return { kind: 'ol', level: 0 }
  return { kind: 'text', level: 0 }
}

/** Splits a paragraph's children into lines at <br> elements and newline characters. */
function splitIntoLines(paragraph: Element, doc: Document): Node[][] {
  const lines: Node[][] = [[]]
  for (const child of Array.from(paragraph.childNodes)) {
    if (child.nodeName === 'BR') {
      lines.push([])
    } else if (child.nodeType === TEXT_NODE && (child.textContent ?? '').includes('\n')) {
      ;(child.textContent ?? '').split('\n').forEach((part, index) => {
        if (index > 0) lines.push([])
        if (part) lines[lines.length - 1]?.push(doc.createTextNode(part))
      })
    } else {
      lines[lines.length - 1]?.push(child)
    }
  }
  return lines
}

function firstTextNode(node: Node): Text | null {
  if (node.nodeType === TEXT_NODE) return (node.textContent ?? '').replace(/\u00a0/g, ' ').trim() ? (node as Text) : null
  for (const child of Array.from(node.childNodes)) {
    const found = firstTextNode(child)
    if (found) return found
  }
  return null
}

/** Removes a block marker ("## ", "- ", "1. ") from the start of a line. */
function stripPrefix(nodes: Node[], pattern: RegExp) {
  for (const node of nodes) {
    const text = firstTextNode(node)
    if (!text) continue
    text.data = text.data.replace(/^[\s\u00a0]+/, '').replace(pattern, '')
    return
  }
}

const isBlankText = (node: Node | undefined) => node?.nodeType === TEXT_NODE && !(node.textContent ?? '').replace(/\u00a0/g, ' ').trim()

/** Drops whitespace-only nodes at both ends and trims the outer text (table cells are padded with spaces). */
function trimEdges(nodes: Node[]): Node[] {
  const trimmed = [...nodes]
  while (isBlankText(trimmed[0])) trimmed.shift()
  while (isBlankText(trimmed[trimmed.length - 1])) trimmed.pop()
  const first = trimmed[0]
  if (first?.nodeType === TEXT_NODE) (first as Text).data = (first as Text).data.replace(/^[\s\u00a0]+/, '')
  const last = trimmed[trimmed.length - 1]
  if (last?.nodeType === TEXT_NODE) (last as Text).data = (last as Text).data.replace(/[\s\u00a0]+$/, '')
  return trimmed
}

function appendAll(parent: Node, nodes: Node[]) {
  for (const node of nodes) parent.appendChild(node)
}

/** Splits a table row's nodes into cells at "|" characters in text nodes. */
function splitCells(nodes: Node[], doc: Document): Node[][] {
  const cells: Node[][] = [[]]
  for (const node of nodes) {
    if (node.nodeType === TEXT_NODE) {
      ;(node.textContent ?? '').split('|').forEach((part, index) => {
        if (index > 0) cells.push([])
        if (part) cells[cells.length - 1]?.push(doc.createTextNode(part))
      })
    } else {
      cells[cells.length - 1]?.push(node)
    }
  }
  if (cells.length && !lineText(cells[0] ?? [])) cells.shift()
  if (cells.length && !lineText(cells[cells.length - 1] ?? [])) cells.pop()
  return cells
}

function buildTable(rows: Line[], doc: Document): Node {
  const dataRows = rows.filter((row) => row.kind === 'row')
  if (dataRows.length === 0) return doc.createElement('hr')
  const hasHeader = rows[1]?.kind === 'separator'
  const table = doc.createElement('table')
  const body = doc.createElement('tbody')
  dataRows.forEach((row, index) => {
    const header = hasHeader && index === 0
    const tr = doc.createElement('tr')
    for (const cellNodes of splitCells(row.nodes, doc)) {
      const cell = doc.createElement(header ? 'th' : 'td')
      if (header) cell.setAttribute('scope', 'col')
      appendAll(cell, trimEdges(cellNodes))
      tr.appendChild(cell)
    }
    if (header) {
      const head = doc.createElement('thead')
      head.appendChild(tr)
      table.appendChild(head)
    } else {
      body.appendChild(tr)
    }
  })
  table.appendChild(body)
  return table
}

const endsSentence = (node: Node) => /[.!?:;…)\]]$/.test((node.textContent ?? '').replace(/\u00a0/g, ' ').trim())

/**
 * Hard-wrapped text puts each line of a sentence in its own paragraph. A line starting in lowercase after a
 * paragraph or list item without closing punctuation continues it; returns the element to append to.
 */
function continuationTarget(previous: ChildNode | null, nodes: Node[]): Element | null {
  const firstNode = nodes.find((node) => !isBlankText(node))
  const continues = /^[a-z(]/.test(lineText(nodes)) || firstNode?.nodeName === 'CODE'
  if (!previous || !continues) return null
  if (previous.nodeName === 'P' && !endsSentence(previous)) return previous as Element
  if (previous.nodeName === 'UL' || previous.nodeName === 'OL') {
    const item = (previous as Element).lastElementChild
    if (item?.nodeName !== 'LI' || endsSentence(item)) return null
    // An item wrapping its text in <p> continues inside that paragraph, not after it.
    const lastChild = Array.from(item.childNodes).filter((node) => !isBlankText(node)).pop()
    return lastChild?.nodeName === 'P' ? (lastChild as Element) : item
  }
  return null
}

/** Appends a block, merging it into a directly preceding list of the same type. */
function appendBlock(out: DocumentFragment, node: Node) {
  const previous = out.lastChild
  if ((node.nodeName === 'UL' || node.nodeName === 'OL') && previous?.nodeName === node.nodeName) {
    for (const child of Array.from(node.childNodes)) previous.appendChild(child)
    return
  }
  out.appendChild(node)
}

/** "**Exterior**" or "WHAT YOU GET" on its own line reads as a sub-heading. */
function labelHeading(paragraph: Element, doc: Document): Element | null {
  if (paragraph.querySelector('br, a, img, code')) return null
  const text = lineText(Array.from(paragraph.childNodes))
  const bold = /^\*\*([^*]+)\*\*$/.exec(text)
  const caps = text.length <= 40 && /[A-Z]{3}/.test(text) && text === text.toUpperCase() && !/[.!?:,]$/.test(text)
  if (!(bold && bold[1] && bold[1].length <= 60) && !caps) return null
  const heading = doc.createElement('h3')
  heading.textContent = bold?.[1] ?? text
  return heading
}

function enhanceInline(root: Node, doc: Document) {
  const walker = doc.createTreeWalker(root, SHOW_TEXT)
  const targets: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    let parent = node.parentNode
    let skip = false
    while (parent && parent !== root) {
      if (SKIP_INLINE.has(parent.nodeName)) {
        skip = true
        break
      }
      parent = parent.parentNode
    }
    if (!skip) targets.push(node as Text)
  }

  for (const text of targets) {
    const value = text.data
    const matches = [...value.matchAll(INLINE)]
    if (matches.length === 0) continue
    const fragment = doc.createDocumentFragment()
    let last = 0
    for (const match of matches) {
      const index = match.index ?? 0
      const [full, bold, code, url, em] = match
      if (index > last) fragment.appendChild(doc.createTextNode(value.slice(last, index)))
      if (bold !== undefined) {
        const strong = doc.createElement('strong')
        strong.textContent = bold
        fragment.appendChild(strong)
      } else if (code !== undefined) {
        const element = doc.createElement('code')
        element.textContent = code
        fragment.appendChild(element)
      } else if (url !== undefined) {
        const clean = url.replace(/[.,;:!?)\]]+$/, '')
        const link = doc.createElement('a')
        link.setAttribute('href', clean)
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
        link.textContent = clean
        fragment.appendChild(link)
        if (clean.length < url.length) fragment.appendChild(doc.createTextNode(url.slice(clean.length)))
      } else if (em !== undefined) {
        const element = doc.createElement('em')
        element.textContent = em
        fragment.appendChild(element)
      }
      last = index + full.length
    }
    if (last < value.length) fragment.appendChild(doc.createTextNode(value.slice(last)))
    text.replaceWith(fragment)
  }
}

export function enhanceDescription(html: string, doc: Document = document): string {
  const source = doc.createElement('template')
  source.innerHTML = html

  // 1. Flatten paragraphs into classified lines; keep every other block as it is.
  const items: Item[] = []
  let group = 0
  for (const node of Array.from(source.content.childNodes)) {
    if (node.nodeName === 'P') {
      group++
      for (const nodes of splitIntoLines(node as Element, doc)) {
        items.push({ line: { ...classify(lineText(nodes)), nodes, group } })
      }
    } else if (!(node.nodeType === TEXT_NODE && !(node.textContent ?? '').trim())) {
      items.push({ element: node })
    }
  }

  // 2. Rebuild, grouping consecutive lines into lists, tables and paragraphs.
  const output = doc.createElement('template')
  const out = output.content
  const lineAt = (index: number): Line | null => {
    const item = items[index]
    return item && 'line' in item ? item.line : null
  }

  let index = 0
  while (index < items.length) {
    const item = items[index] as Item
    if ('element' in item) {
      appendBlock(out, item.element)
      index++
      continue
    }
    const line = item.line
    if (line.kind === 'empty') {
      index++
    } else if (line.kind === 'heading') {
      const heading = doc.createElement(`h${Math.min(Math.max(line.level, 2), 4)}`)
      stripPrefix(line.nodes, /^#{1,6}\s+/)
      appendAll(heading, line.nodes)
      out.appendChild(heading)
      index++
    } else if (line.kind === 'ul' || line.kind === 'ol') {
      const list = doc.createElement(line.kind)
      const marker = line.kind === 'ul' ? /^[-*•]\s+/ : /^\d+[.)]\s+/
      for (let next = lineAt(index); next && next.kind === line.kind; next = lineAt(index)) {
        const li = doc.createElement('li')
        stripPrefix(next.nodes, marker)
        appendAll(li, next.nodes)
        list.appendChild(li)
        index++
      }
      appendBlock(out, list)
    } else if (line.kind === 'row' || line.kind === 'separator') {
      const rows: Line[] = []
      for (let next = lineAt(index); next && (next.kind === 'row' || next.kind === 'separator'); next = lineAt(index)) {
        rows.push(next)
        index++
      }
      out.appendChild(buildTable(rows, doc))
    } else {
      const target = continuationTarget(out.lastChild, line.nodes)
      const paragraph = target ?? doc.createElement('p')
      let first = true
      for (let next = lineAt(index); next && next.kind === 'text' && next.group === line.group; next = lineAt(index)) {
        if (first && target) {
          stripPrefix(next.nodes, /^/)
          paragraph.appendChild(doc.createTextNode(' '))
        } else if (!first) {
          paragraph.appendChild(doc.createElement('br'))
        }
        appendAll(paragraph, next.nodes)
        first = false
        index++
      }
      if (!target) out.appendChild(labelHeading(paragraph, doc) ?? paragraph)
    }
  }

  // 3. Inline Markdown and bare links (merge text split by the joins above first, so **bold** can span them).
  out.normalize()
  enhanceInline(out, doc)

  // 4. Code pasted into the editor often gains a blank line after every line: collapse those.
  for (const pre of Array.from(out.querySelectorAll('pre'))) {
    const walker = doc.createTreeWalker(pre, SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text
      text.data = text.data.replace(/\n(?:[ \t\u00a0]*\n)+/g, (gap) => (gap.split('\n').length > 3 ? '\n\n' : '\n'))
    }
    const first = firstTextNode(pre)
    if (first) first.data = first.data.replace(/^\s*\n/, '')
  }
  return output.innerHTML
}
