import { useState } from 'react'
import { site } from '../../config/site'
import type { Product } from '../../lib/catalog'
import { tebexPackageUrl } from '../../lib/url'
import { useBasket, type PurchaseIntent } from '../../state/basket-context'
import { useCatalog } from '../../state/catalog-context'
import { Button, LinkButton } from '../ui/Button'
import { BasketIcon, CheckIcon, ExternalIcon } from '../ui/icons'

/**
 * Purchase buttons. Every action goes through the Tebex basket; nothing is ever marked as bought here.
 * `compact` renders the single small button used on product cards.
 */
export function PurchaseActions({ product, compact = false }: { product: Product; compact?: boolean }) {
  const basket = useBasket()
  const { snapshotAt } = useCatalog()
  const [clicked, setClicked] = useState<PurchaseIntent | null>(null)
  if (!basket.enabled) return null

  if (product.requiresInput || snapshotAt) {
    // The package asks for details only the Tebex store can collect, or Tebex's API is unreachable from this browser.
    return (
      <LinkButton to={tebexPackageUrl(site.links.store, product.id)} size={compact ? 'sm' : 'lg'} variant={compact ? 'secondary' : 'primary'}>
        Buy on Tebex
        <ExternalIcon size={16} />
        <span className="sr-only">(opens the official store in a new tab)</span>
      </LinkButton>
    )
  }

  const inBasket = basket.isInBasket(product.id)
  const adding = basket.pendingIdent === product.ident
  const redirecting = basket.phase === 'redirecting'
  const run = (intent: PurchaseIntent) => {
    setClicked(intent)
    void basket.addToBasket(product, intent)
  }

  if (compact) {
    return inBasket ? (
      <Button variant="secondary" size="sm" onClick={basket.openDrawer} aria-label={`${product.title} is in your basket. View basket`}>
        <CheckIcon size={16} />
        In basket
      </Button>
    ) : (
      <Button
        size="sm"
        loading={adding}
        disabled={basket.isBusy}
        onClick={() => run('basket')}
        aria-label={`Add ${product.title} to basket`}
      >
        {adding ? null : <BasketIcon size={16} />}
        Add
      </Button>
    )
  }

  if (inBasket) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto sm:flex-1" loading={redirecting} loadingLabel="Redirecting to Tebex…" disabled={basket.isBusy} onClick={() => void basket.checkout()}>
          Checkout
        </Button>
        <Button variant="secondary" size="lg" className="w-full sm:w-auto sm:flex-1" onClick={basket.openDrawer}>
          <CheckIcon size={18} />
          In your basket
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="w-full sm:w-auto sm:flex-1"
        loading={(adding && clicked === 'basket') || (redirecting && clicked === 'basket')}
        loadingLabel={redirecting ? 'Redirecting to Tebex…' : 'Adding…'}
        disabled={basket.isBusy}
        onClick={() => run('basket')}
      >
        <BasketIcon size={18} />
        Add to basket
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="w-full sm:w-auto sm:flex-1"
        loading={(adding || redirecting) && clicked === 'checkout'}
        loadingLabel={redirecting ? 'Redirecting to Tebex…' : 'Preparing checkout…'}
        disabled={basket.isBusy}
        onClick={() => run('checkout')}
      >
        Buy now
      </Button>
    </div>
  )
}
