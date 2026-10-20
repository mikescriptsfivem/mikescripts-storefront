import { useCallback, useMemo, useState } from 'react'
import { media } from '../../config/media'
import type { Product } from '../../lib/catalog'
import { mediaSources } from '../../lib/media'
import { ImageFallback } from '../ui/Picture'
import { ExpandIcon } from '../ui/icons'
import { Lightbox, type LightboxImage } from '../ui/Lightbox'

/** Thumbnails shown under the main image; the last one opens the rest in the lightbox. */
const THUMBNAILS = 6

/** Tebex images first (package image, then media), followed by local screenshots from products.ts. */
function galleryImages(product: Product): LightboxImage[] {
  const seen = new Set<string>()
  const images: LightboxImage[] = []
  const add = (image: LightboxImage) => {
    if (!image.src || seen.has(image.src)) return
    seen.add(image.src)
    images.push(image)
  }
  if (product.image) add({ src: product.image, alt: product.name })
  for (const item of product.media) {
    if (item.type === 'image') add({ src: item.url, alt: `${product.name} screenshot` })
  }
  for (const id of product.content?.gallery ?? []) {
    add({ ...mediaSources(id), alt: media[id].alt })
  }
  return images
}

export function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => galleryImages(product), [product])
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const current = images[active] ?? images[0]

  if (!current) {
    return (
      <div className="aspect-[16/9] overflow-hidden rounded-lg border border-ink-700">
        <ImageFallback label={product.name} />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(active)}
        className="group relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-850"
        aria-label={`View image ${active + 1} of ${images.length} full screen`}
      >
        <img
          src={current.src}
          srcSet={current.srcSet}
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt={current.alt}
          fetchPriority="high"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandIcon size={18} />
        </span>
      </button>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Product images">
          {images.slice(0, THUMBNAILS).map((image, index) => {
            const hidden = images.length - THUMBNAILS
            const isMoreTile = index === THUMBNAILS - 1 && hidden > 0
            return (
              <li key={image.src} className={index >= 4 ? 'hidden sm:block' : ''}>
                <button
                  type="button"
                  onClick={() => (isMoreTile ? setLightbox(index) : setActive(index))}
                  aria-label={isMoreTile ? `View all ${images.length} images` : `Show image ${index + 1}: ${image.alt}`}
                  aria-current={index === active ? 'true' : undefined}
                  className={`relative block aspect-[16/9] w-full overflow-hidden rounded border transition ${index === active ? 'border-accent-500 opacity-100' : 'border-ink-700 opacity-60 hover:opacity-100'}`}
                >
                  <img src={image.src} srcSet={image.srcSet} sizes="160px" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {isMoreTile ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70 text-sm font-semibold text-white">+{hidden + 1}</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {images.length > 4 ? (
        <button type="button" onClick={() => setLightbox(0)} className="mt-3 text-sm font-medium text-accent-400 hover:text-accent-300 sm:hidden">
          View all {images.length} images
        </button>
      ) : null}

      <Lightbox images={images} index={lightbox} onClose={closeLightbox} onNavigate={setLightbox} />
    </div>
  )
}
