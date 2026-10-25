import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import { site, type HeroSlide } from '../../config/site'
import { formatPrice } from '../../lib/format'
import type { Product } from '../../lib/catalog'
import { useBasket } from '../../state/basket-context'
import { useCatalog } from '../../state/catalog-context'
import { PurchaseActions } from '../product/PurchaseActions'
import { buttonClasses } from '../ui/button-styles'
import { ImageFallback, Picture, RemoteImage } from '../ui/Picture'

function SlidePrice({ product, fallback }: { product: Product | undefined; fallback: string }) {
  if (!product) {
    const free = fallback.toLowerCase() === 'free'
    return (
      <p className="text-[15px] font-bold text-mist-50">
        {fallback}
        {free ? null : <span className="ml-1 text-xs font-medium text-mist-500">USD</span>}
      </p>
    )
  }
  const free = product.price.amount === 0
  return (
    <p className="text-[15px] font-bold text-mist-50">
      {free ? 'Free' : formatPrice(product.price.amount, product.price.currency)}
      {free ? null : <span className="ml-1 text-xs font-medium uppercase text-mist-500">{product.price.currency}</span>}
    </p>
  )
}

function SlideMedia({ slide, product, priority }: { slide: HeroSlide; product: Product | undefined; priority: boolean }) {
  if (slide.image) {
    return <Picture id={slide.image} alt="" sizes="(min-width: 1024px) 480px, 100vw" priority={priority} className="h-full w-full object-cover" />
  }
  if (product?.image) {
    return <RemoteImage src={product.image} alt="" fallbackLabel={slide.title} priority={priority} className="h-full w-full object-cover" />
  }
  return <ImageFallback label={slide.title} />
}

/** Cycles featured scripts beside the hero. Pauses while the pointer or keyboard focus is inside. */
export function FeaturedRotator() {
  const slides = site.hero.slides
  const { catalog } = useCatalog()
  const basket = useBasket()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const labelId = useId()

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <aside
      className="min-w-0 max-w-[480px] lg:max-w-none"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <p id={labelId} className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-mist-400">
        Featured now
      </p>
      <div className="grid overflow-hidden rounded-lg border border-white/10 bg-ink-900/80 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index
          const product = catalog?.byContentKey.get(slide.productKey)
          const href = `/scripts/${product?.slug ?? slide.slug}`
          return (
            <article
              key={slide.productKey}
              className={`col-start-1 row-start-1 flex h-full flex-col transition-opacity duration-500 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-hidden={!active}
              inert={!active}
            >
              <div className="aspect-video overflow-hidden border-b border-white/5 bg-black">
                <SlideMedia slide={slide} product={product} priority={slideIndex === 0} />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="inline-flex self-start rounded-full border border-accent-400/30 bg-accent-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-300">
                  {slide.category}
                </span>
                <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-white">
                  <Link to={href} className="hover:text-accent-300">
                    {slide.title}
                  </Link>
                </h3>
                <p className="flex-1 text-[13px] leading-snug text-mist-400">{slide.text}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <SlidePrice product={product} fallback={slide.priceLabel} />
                  {product && basket.enabled ? (
                    <PurchaseActions product={product} compact />
                  ) : (
                    <Link to={href} className={buttonClasses('primary', 'sm')}>
                      Add
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <span
          key={reduced ? 'still' : index}
          className={`block h-full rounded-full bg-accent-400 ${reduced ? 'w-full' : 'animate-feature-progress'} ${paused ? '[animation-play-state:paused]' : ''}`}
          onAnimationEnd={() => {
            if (!reduced && !paused) setIndex((current) => (current + 1) % slides.length)
          }}
        />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Featured slides">
        {slides.map((slide, slideIndex) => {
          const selected = slideIndex === index
          return (
            <button
              key={slide.productKey}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Slide ${slideIndex + 1}: ${slide.title}`}
              className={`h-2 rounded-full transition-all ${selected ? 'w-[22px] bg-accent-400' : 'w-2 bg-ink-600 hover:bg-mist-400'}`}
              onClick={() => setIndex(slideIndex)}
            />
          )
        })}
      </div>
    </aside>
  )
}
