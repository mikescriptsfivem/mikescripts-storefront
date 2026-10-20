import { useState, type ImgHTMLAttributes } from 'react'
import { brand, media, type MediaAsset, type MediaId } from '../../config/media'
import { mediaSources } from '../../lib/media'
import { publicAsset } from '../../lib/url'

type BaseProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt'> & {
  /** Load immediately (above-the-fold images). Everything else is lazy-loaded. */
  priority?: boolean
}

/** Local artwork from the media manifest, with responsive WebP variants. */
export function Picture({ id, alt, sizes = '100vw', priority = false, className = '', ...props }: BaseProps & { id: MediaId; alt?: string }) {
  const asset: MediaAsset = media[id]
  const { src, srcSet } = mediaSources(id)
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt ?? asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      {...props}
    />
  )
}

/** Neutral branded tile shown when a product has no artwork (or an image fails to load). */
export function ImageFallback({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-ink-850 ${className}`} role="img" aria-label={label}>
      <img src={publicAsset(brand.logoMarkSmall)} alt="" width={64} height={64} className="h-14 w-14 opacity-60" />
      <span className="max-w-[80%] truncate font-display text-lg uppercase tracking-wider text-mist-500">{label}</span>
    </div>
  )
}

/** An image from Tebex (or any URL), lazy-loaded, with a branded fallback if it fails. */
export function RemoteImage({
  src,
  alt,
  priority = false,
  className = '',
  fallbackLabel,
  ...props
}: BaseProps & { src: string | null; alt: string; fallbackLabel: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) return <ImageFallback label={fallbackLabel} className={className} />
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={className}
      {...props}
    />
  )
}
