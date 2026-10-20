import { Link } from 'react-router'
import type { Product } from '../../lib/catalog'
import { PriceTag } from './PriceTag'
import { ProductImage } from './ProductImage'
import { PurchaseActions } from './PurchaseActions'

interface ProductCardProps {
  product: Product
  /** "feature" is the larger card used at the top of the homepage. */
  variant?: 'default' | 'feature'
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function ProductCard({ product, variant = 'default', priority = false, headingLevel: Heading = 'h3' }: ProductCardProps) {
  const feature = variant === 'feature'
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-900 transition-colors duration-300 hover:border-ink-500 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent-400">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-850">
        <ProductImage
          product={product}
          priority={priority}
          sizes={feature ? '(min-width: 768px) 50vw, 100vw' : undefined}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className={`flex flex-1 flex-col ${feature ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-400">{product.categoryName}</p>
        <Heading
          className={`mt-2 font-display font-semibold uppercase leading-[1.05] tracking-wide text-white ${feature ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}
        >
          <Link to={`/scripts/${product.slug}`} className="line-clamp-2 after:absolute after:inset-0 focus-visible:outline-none">
            {product.title}
          </Link>
        </Heading>
        <p className={`mt-3 text-sm leading-relaxed text-mist-400 ${feature ? 'line-clamp-3 sm:text-[15px]' : 'line-clamp-2'}`}>{product.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <PriceTag price={product.price} type={product.type} />
          <div className="relative z-10 shrink-0">
            <PurchaseActions product={product} compact />
          </div>
        </div>
      </div>
    </article>
  )
}
