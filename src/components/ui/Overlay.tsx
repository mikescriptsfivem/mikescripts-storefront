import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'
import { CloseIcon } from './icons'

interface OverlayProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

/** Slide-in panel from the right (used for the basket). */
export function Drawer({ open, onClose, title, children, footer }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDialogBehavior(open, onClose, panelRef)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col border-l border-ink-700 bg-ink-900 shadow-2xl shadow-black focus:outline-none"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-ink-700 px-6">
          <h2 id={titleId} className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-md p-2 text-mist-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="shrink-0 border-t border-ink-700 bg-ink-900 p-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/** Centred dialog. */
export function Modal({ open, onClose, title, children, footer }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDialogBehavior(open, onClose, panelRef)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md animate-fade-up rounded-lg border border-ink-600 bg-ink-900 shadow-2xl shadow-black focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-700 px-6 py-5">
          <h2 id={titleId} className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 rounded-md p-2 text-mist-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-ink-700 px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
