import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDialogBehavior } from '../../hooks/useDialogBehavior'
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from './icons'

export interface LightboxImage {
  src: string
  srcSet?: string
  alt: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/** Full-screen image viewer with keyboard navigation (← → Esc). */
export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const open = index !== null && images.length > 0
  useDialogBehavior(open, onClose, ref)

  useEffect(() => {
    if (index === null || images.length < 2) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onNavigate((index + 1) % images.length)
      if (event.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, images.length, onNavigate])

  if (index === null) return null
  const image = images[index]
  if (!image) return null
  const multiple = images.length > 1

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex animate-fade-in flex-col bg-black/95 focus:outline-none"
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-mist-300 sm:px-6">
        <span aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-mist-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close image viewer"
          data-autofocus
        >
          <CloseIcon size={22} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20">
        <img src={image.src} srcSet={image.srcSet} sizes="100vw" alt={image.alt} className="max-h-full max-w-full object-contain" />
        {multiple ? (
          <>
            <button
              type="button"
              onClick={() => onNavigate((index - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white transition-colors hover:bg-white/15 sm:left-6"
              aria-label="Previous image"
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => onNavigate((index + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white transition-colors hover:bg-white/15 sm:right-6"
              aria-label="Next image"
            >
              <ArrowRightIcon />
            </button>
          </>
        ) : null}
      </div>
      <p className="px-6 py-4 text-center text-sm text-mist-400">{image.alt}</p>
    </div>,
    document.body,
  )
}
