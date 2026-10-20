import { useMemo, useState } from 'react'
import { site } from '../config/site'
import { detectBrowser, unblockGuide } from '../lib/browser'
import { Button, LinkButton } from './ui/Button'
import { ExternalIcon } from './ui/icons'
import { Modal } from './ui/Overlay'

/** "How to fix" button with browser-specific steps for unblocking headless.tebex.io. */
export function UnblockHelp({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const guide = useMemo(() => unblockGuide(detectBrowser()), [])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        How to fix
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Unblock the store"
        footer={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <LinkButton to={site.links.store} variant="secondary">
              Official store
              <ExternalIcon size={16} />
            </LinkButton>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-mist-300">{guide.cause}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-mist-500">In {guide.browser}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mist-200 marker:text-accent-400">
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {guide.alternative ? <p className="mt-4 text-sm leading-relaxed text-mist-400">{guide.alternative}</p> : null}
        <p className="mt-4 text-sm leading-relaxed text-mist-400">
          Until then you can still browse everything here, and buying works on the official Tebex store.
        </p>
      </Modal>
    </>
  )
}
