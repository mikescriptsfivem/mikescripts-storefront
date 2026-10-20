import { site } from '../../config/site'
import { tebexPackageUrl } from '../../lib/url'
import { useBasket } from '../../state/basket-context'
import { useCatalog } from '../../state/catalog-context'
import { PriceTag } from '../product/PriceTag'
import { ProductImage } from '../product/ProductImage'
import { Button, LinkButton } from '../ui/Button'
import { Chip, Eyebrow } from '../ui/layout'
import { ArrowRightIcon, CheckIcon, ExternalIcon } from '../ui/icons'
import { Reveal } from '../ui/Reveal'

/** Large editorial section for the product chosen in site.featuredRelease. Hidden unless it is live on Tebex. */
export function FeaturedRelease() {
  const { catalog } = useCatalog()
  const basket = useBasket()
  const product = catalog?.byContentKey.get(site.featuredRelease)
  if (!product) return null

  const content = product.content
  const inBasket = basket.isInBasket(product.id)
  const adding = basket.pendingIdent === product.ident

  return (
    <section aria-labelledby="featured-release-heading" className="border-y border-ink-700 bg-ink-900">
      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-850 lg:aspect-auto lg:min-h-[680px]">
          <ProductImage
            product={product}
            preferLocal
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-l from-ink-900 to-transparent lg:block" />
        </div>

        <Reveal className="flex flex-col justify-center px-4 py-14 sm:px-10 lg:px-12 xl:px-20">
          <Eyebrow>Featured release</Eyebrow>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-500">{product.categoryName}</p>
          <h2
            id="featured-release-heading"
            className={`mt-2 text-balance font-display font-semibold uppercase leading-[0.92] tracking-wide text-white ${product.title.length > 22 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'}`}
          >
            {product.title}
          </h2>
          {content?.tagline ? <p className="mt-5 text-lg leading-relaxed text-mist-300">{content.tagline}</p> : null}

          {content?.highlights?.length ? (
            <ul className="mt-8 space-y-3">
              {content.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-accent-400" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          {content?.compatibility?.length ? (
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Compatibility">
              {content.compatibility.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-6 border-t border-ink-700 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <PriceTag price={product.price} type={product.type} size="lg" />
            <div className="flex flex-wrap gap-3">
              {product.requiresInput ? (
                <LinkButton to={tebexPackageUrl(site.links.store, product.id)}>
                  Purchase on Tebex
                  <ExternalIcon size={16} />
                </LinkButton>
              ) : basket.enabled ? (
                <Button
                  loading={adding || (basket.phase === 'redirecting' && !inBasket)}
                  loadingLabel={basket.phase === 'redirecting' ? 'Redirecting…' : 'Adding…'}
                  disabled={basket.isBusy}
                  onClick={() => void (inBasket ? basket.checkout() : basket.addToBasket(product, 'checkout'))}
                >
                  {inBasket ? 'Checkout' : 'Purchase'}
                </Button>
              ) : null}
              <LinkButton to={`/scripts/${product.slug}`} variant="secondary">
                View product
                <ArrowRightIcon size={16} />
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
