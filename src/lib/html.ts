/**
 * Plain-text helpers for Tebex HTML (summaries, meta descriptions, search).
 * No DOMPurify here, so this module stays out of the sanitiser chunk, and no DOM APIs, so it also runs in Node.
 * Tebex descriptions often contain Markdown typed into the editor ("## Heading", "- item", "**bold**"),
 * so these helpers understand those markers too.
 */

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match
  })
}

/** Visible lines of an HTML fragment, one per block element, with Markdown markers kept. */
export function htmlToLines(html: string): string[] {
  const marked = html
    .replace(/\r?\n/g, ' ')
    .replace(/<h([1-6])[^>]*>/gi, (_match, level: string) => `\n${'#'.repeat(Number(level))} `)
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|pre|ul|ol|table)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
  return decodeEntities(marked)
    .split('\n')
    .map((line) => line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const STRUCTURAL_LINE = /^(#{1,6}\s|[-*•]\s|\d+[.)]\s|\|)/

/** Removes inline Markdown (**bold**, __bold__, `code`, *italic*). */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=$|[\s.,;:!?)])/g, '$1$2')
}

/** Plain text from HTML: block markers and tables removed. Never executes the markup. */
export function htmlToText(html: string): string {
  return htmlToLines(html)
    .filter((line) => !line.startsWith('|'))
    .map((line) => stripInlineMarkdown(line.replace(/^(#{1,6}|[-*•]|\d+[.)])\s+/, '')))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Shortens text at a word boundary. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:–—-]+$/, '')}…`
}

/**
 * A short summary for cards and meta descriptions: the first real sentence-like paragraph,
 * skipping headings, list items, tables, short labels and bare links.
 */
export function summaryFromHtml(html: string, maxLength = 170): string {
  const lines = htmlToLines(html)
  const clean = (line: string) =>
    stripInlineMarkdown(line)
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? ''
    if (STRUCTURAL_LINE.test(line)) continue
    let text = clean(line)
    // Hard-wrapped paragraphs: keep joining lines that continue the sentence.
    while (!/[.!?…:]$/.test(text) && text.length < maxLength) {
      const next = lines[index + 1]
      if (!next || STRUCTURAL_LINE.test(next) || !/^[a-z(]/.test(next)) break
      text = `${text} ${clean(next)}`
      index++
    }
    if (text.length >= 40) return truncate(text, maxLength)
  }
  return truncate(htmlToText(html), maxLength)
}
