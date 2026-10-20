import DOMPurify from 'dompurify'

/** Video embeds allowed inside Tebex descriptions. Everything else in an iframe is removed. */
const EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'streamable.com',
  'medal.tv',
])

function isAllowedEmbed(src: string): boolean {
  try {
    const url = new URL(src, window.location.href)
    return url.protocol === 'https:' && EMBED_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

let hooksInstalled = false

function installHooks() {
  if (hooksInstalled) return
  hooksInstalled = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof Element)) return
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') ?? ''
      if (/^https?:\/\//i.test(href)) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    } else if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy')
      node.setAttribute('decoding', 'async')
    } else if (node.tagName === 'IFRAME') {
      if (!isAllowedEmbed(node.getAttribute('src') ?? '')) {
        node.remove()
        return
      }
      node.setAttribute('loading', 'lazy')
      node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
      node.setAttribute('allowfullscreen', '')
    }
  })
}

/**
 * Sanitises HTML from Tebex (package descriptions, custom pages) before it is rendered.
 * Inline styles are stripped so store content always follows the site theme.
 */
export function sanitizeHtml(html: string): string {
  installHooks()
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea'],
    FORBID_ATTR: ['style', 'class', 'id'],
  })
}
