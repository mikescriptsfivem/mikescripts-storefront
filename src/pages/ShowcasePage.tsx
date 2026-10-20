import { useCallback, useMemo, useState } from 'react'
import { LinkButton } from '../components/ui/Button'
import { ArrowRightIcon } from '../components/ui/icons'
import { Container, PageHeader } from '../components/ui/layout'
import { Lightbox, type LightboxImage } from '../components/ui/Lightbox'
import { media } from '../config/media'
import { showcase } from '../config/showcase'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Product } from '../lib/catalog'
import { mediaSources } from '../lib/media'
import { useCatalog } from '../state/catalog-context'

interface GalleryGroup {
  id: string
  title: string
  subtitle: string
  product?: Product
  /** True when the gallery shows content included with `product` rather than the product itself. */
  included?: boolean
  images: LightboxImage[]
}

function Gallery({ group }: { group: GalleryGroup }) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <section id={group.id} aria-labelledby={`${group.id}-heading`} className="scroll-mt-36 border-t border-ink-700 py-16 first:border-t-0 sm:py-20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={`${group.id}-heading`} className="font-display text-4xl font-semibold uppercase tracking-wide text-white sm:text-5xl">
            {group.title}
          </h2>
          {group.subtitle ? <p className="mt-3 text-mist-400">{group.subtitle}</p> : null}
        </div>
        {group.product ? (
          <LinkButton to={`/scripts/${group.product.slug}`} variant="secondary">
            {group.included ? `View ${group.product.title}` : 'View script'}
            <ArrowRightIcon size={16} />
          </LinkButton>
        ) : null}
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {group.images.map((image, index) => (
          <li key={image.src} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group block aspect-[16/9] h-full w-full overflow-hidden rounded-md border border-ink-700 bg-ink-850"
              aria-label={`Enlarge: ${image.alt}`}
            >
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={index === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={group.images} index={open} onClose={close} onNavigate={setOpen} />
    </section>
  )
}

export default function ShowcasePage() {
  usePageMeta('Showcase', 'Renders and screenshots of MikeScripts FiveM releases.')
  const { catalog } = useCatalog()

  const groups = useMemo<GalleryGroup[]>(() => {
    const local: GalleryGroup[] = showcase
      .map((group) => {
        const key = group.productKey ?? group.includedWith
        return { group, product: key ? catalog?.byContentKey.get(key) : undefined }
      })
      .filter(({ group, product }) => !group.onlyWhenLive || product)
      .map(({ group, product }) => ({
        id: group.id,
        title: group.title,
        subtitle: group.subtitle,
        product,
        included: Boolean(group.includedWith),
        images: group.images.map((id) => ({ ...mediaSources(id), alt: media[id].alt })),
      }))

    // Every other live product, with its own Tebex images.
    const covered = new Set(local.filter((group) => !group.included).map((group) => group.product?.ident).filter(Boolean))
    const fromStore: GalleryGroup[] = (catalog?.products ?? [])
      .filter((product) => !covered.has(product.ident))
      .map((product) => {
        const urls = [product.image, ...product.media.filter((item) => item.type === 'image').map((item) => item.url)].filter(
          (url, index, list): url is string => Boolean(url) && list.indexOf(url) === index,
        )
        return {
          id: product.slug,
          title: product.title,
          subtitle: product.content?.tagline ?? product.summary,
          product,
          images: urls.slice(0, 7).map((src, index) => ({ src, alt: `${product.title}, image ${index + 1}` })),
        }
      })
      .filter((group) => group.images.length > 0)

    return [...local, ...fromStore]
  }, [catalog])

  return (
    <>
      <PageHeader
        eyebrow="Showcase"
        title="Built in detail"
        description="Renders and screenshots of MikeScripts releases. Select any image to view it full screen."
        footer={
          <nav aria-label="Showcase sections" className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <a key={group.id} href={`#${group.id}`} className="rounded-md border border-ink-600 px-3 py-1.5 text-sm text-mist-300 transition-colors hover:border-mist-400 hover:text-white">
                {group.title}
              </a>
            ))}
          </nav>
        }
      />
      <Container>
        {groups.map((group) => (
          <Gallery key={group.id} group={group} />
        ))}
      </Container>
    </>
  )
}
