import type { Price } from '../../lib/catalog'
import { formatPrice } from '../../lib/format'

/** Live Tebex price. Discounts are only shown when Tebex reports one. */
export function PriceTag({ price, type, size = 'md' }: { price: Price; type?: string; size?: 'md' | 'lg' }) {
  const isFree = price.amount === 0
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-semibold tabular-nums text-white ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
        {isFree ? 'Free' : formatPrice(price.amount, price.currency)}
      </span>
      {!isFree ? <span className="text-[11px] font-semibold uppercase tracking-wider text-mist-500">{price.currency}</span> : null}
      {type === 'subscription' ? <span className="text-[11px] font-medium text-mist-400">subscription</span> : null}
      {price.discount > 0 ? (
        <span className="rounded bg-accent-600/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent-300">
          Save {formatPrice(price.discount, price.currency)}
        </span>
      ) : null}
    </div>
  )
}
