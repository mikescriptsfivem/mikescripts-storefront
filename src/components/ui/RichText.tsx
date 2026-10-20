import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g

/**
 * Renders config text with two lightweight formats: [label](url) links and `inline code`.
 * Links starting with "/" are internal routes; others open in a new tab.
 */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > lastIndex) parts.push(text.slice(lastIndex, index))
    const [, label, href, code] = match
    if (code !== undefined) {
      parts.push(
        <code key={index} className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[0.85em] text-mist-50">
          {code}
        </code>,
      )
    } else if (label !== undefined && href !== undefined) {
      const linkClass = 'text-accent-400 underline underline-offset-[3px] hover:text-accent-300'
      parts.push(
        href.startsWith('/') ? (
          <Link key={index} to={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {label}
          </a>
        ),
      )
    }
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  )
}
