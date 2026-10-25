import { useEffect, useState } from 'react'
import { site } from '../../config/site'
import { Container } from '../ui/layout'
import { CheckIcon, CopyIcon, PlayIcon } from '../ui/icons'

/** Slim bar above the main menu with the FiveM server's connect command. Hidden when no address is set. */
export function ServerBar() {
  const { label, address, joinUrl } = site.fivemServer
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  if (!address) return null
  const command = `connect ${address}`
  const connectHref = joinUrl || `fivem://connect/${address}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch {
      window.prompt('Copy this command and paste it into the FiveM F8 console:', command)
    }
  }

  return (
    <div className="border-b border-ink-700 bg-ink-900">
      <Container className="flex h-10 items-center justify-between gap-3 text-[13px]">
        <p className="flex min-w-0 items-center gap-2.5 text-mist-300">
          <span className="hidden font-medium text-mist-200 sm:inline">{label}</span>
          <code className="truncate rounded border border-ink-600 bg-ink-850 px-2 py-0.5 font-mono text-[12px] text-mist-50">{command}</code>
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => void copy()}
            className="flex h-7 items-center gap-1.5 rounded px-2.5 font-medium text-mist-300 transition-colors hover:bg-white/5 hover:text-white"
            aria-label={copied ? 'Connect command copied' : `Copy "${command}"`}
          >
            {copied ? <CheckIcon size={14} className="text-success-400" /> : <CopyIcon size={14} />}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <a href={connectHref} className="flex h-7 items-center gap-1.5 rounded bg-accent-400 px-3 font-bold text-ink-950 transition-colors hover:bg-accent-500">
            <PlayIcon size={13} />
            Connect
          </a>
        </div>
      </Container>
    </div>
  )
}
