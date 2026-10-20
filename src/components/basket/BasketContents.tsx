import { Link } from 'react-router'
import { formatPrice } from '../../lib/format'
import { useBasket } from '../../state/basket-context'
import { useCatalog } from '../../state/catalog-context'
import { Button, LinkButton } from '../ui/Button'
import { RemoteImage } from '../ui/Picture'
import { LockIcon, TrashIcon, UserIcon } from '../ui/icons'

/** Basket line items. Used in the drawer and on the /basket page. */
export function BasketItems({ onNavigate }: { onNavigate?: () => void }) {
  const basket = useBasket()
  const { catalog } = useCatalog()
  const items = basket.basket?.packages ?? []

  if (basket.phase === 'restoring') {
    return <p className="p-6 text-sm text-mist-400">Loading your basket…</p>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold uppercase tracking-wide text-white">Your basket is empty</p>
        <p className="mt-2 max-w-xs text-sm text-mist-400">Browse the catalogue and add a script to get started.</p>
        <LinkButton to="/scripts" className="mt-6">
          Browse scripts
        </LinkButton>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-ink-700">
      {items.map((item) => {
        const product = catalog?.byId.get(item.id)
        const price = item.in_basket?.price ?? 0
        const quantity = item.in_basket?.quantity ?? 1
        return (
          <li key={item.id} className="flex gap-4 p-6">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded border border-ink-700 bg-ink-850">
              <RemoteImage src={item.image ?? product?.image ?? null} alt="" fallbackLabel={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              {product ? (
                <Link to={`/scripts/${product.slug}`} onClick={onNavigate} className="line-clamp-2 font-medium text-white hover:text-accent-300">
                  {product.title}
                </Link>
              ) : (
                <p className="line-clamp-2 font-medium text-white">{item.name}</p>
              )}
              <p className="mt-1 text-sm tabular-nums text-mist-400">
                {formatPrice(price, basket.basket?.currency ?? product?.price.currency ?? 'USD')}
                {quantity > 1 ? ` × ${quantity}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void basket.removeFromBasket(item.id)}
              disabled={basket.isBusy}
              className="-m-2 h-fit rounded-md p-2 text-mist-500 transition-colors hover:bg-white/5 hover:text-danger-400 disabled:opacity-50"
              aria-label={`Remove ${product?.title ?? item.name} from basket`}
            >
              <TrashIcon size={18} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Totals, account line and the checkout button. */
export function BasketSummary() {
  const basket = useBasket()
  const current = basket.basket
  const hasItems = Boolean(current && current.packages.length > 0)

  return (
    <div className="space-y-5">
      {hasItems && current ? (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-mist-400">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(current.base_price, current.currency)}</dd>
          </div>
          {current.sales_tax > 0 ? (
            <div className="flex justify-between text-mist-400">
              <dt>Tax</dt>
              <dd className="tabular-nums">{formatPrice(current.sales_tax, current.currency)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-ink-700 pt-3 text-base font-semibold text-white">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(current.total_price, current.currency)}</dd>
          </div>
        </dl>
      ) : null}

      {basket.isAuthorized ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-ink-700 bg-ink-850 px-4 py-3 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-mist-300">
            <UserIcon size={16} className="shrink-0 text-accent-400" />
            <span className="truncate">
              Logged in as <span className="font-medium text-white">{basket.username}</span>
            </span>
          </span>
          <button type="button" onClick={basket.logout} disabled={basket.isBusy} className="shrink-0 text-mist-400 underline-offset-2 hover:text-white hover:underline">
            Log out
          </button>
        </div>
      ) : null}

      {hasItems ? (
        <Button
          size="lg"
          className="w-full"
          onClick={() => void basket.checkout()}
          loading={basket.phase === 'redirecting' || (basket.phase === 'working' && !basket.pendingIdent)}
          loadingLabel={basket.phase === 'redirecting' ? 'Redirecting to Tebex…' : 'Preparing checkout…'}
          disabled={basket.isBusy}
        >
          <LockIcon size={18} />
          Checkout with Tebex
        </Button>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-mist-500">
        Payment is completed on Tebex’s secure checkout. Card details are never entered on this website.
      </p>
    </div>
  )
}
