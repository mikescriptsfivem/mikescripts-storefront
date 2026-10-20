import { LinkButton } from '../components/ui/Button'
import { Notice } from '../components/ui/feedback'
import { CheckIcon, ExternalIcon } from '../components/ui/icons'
import { Container, PageHeader } from '../components/ui/layout'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice } from '../lib/format'
import { useBasket } from '../state/basket-context'

/**
 * Tebex returns customers here after payment (complete_url).
 * A success message is only shown when Tebex itself reports the basket as complete.
 */
export default function CheckoutCompletePage() {
  const basket = useBasket()
  usePageMeta('Order status')
  const completed = basket.completedBasket

  return (
    <>
      <PageHeader eyebrow="Checkout" title={completed ? 'Thank you for your order' : 'Order status'} />
      <Container className="py-12 sm:py-16">
        {basket.phase === 'restoring' ? (
          <p role="status" className="text-mist-400">
            Checking your order with Tebex…
          </p>
        ) : completed ? (
          <div className="max-w-2xl">
            <div role="status" className="flex gap-4 rounded-lg border border-success-400/30 bg-success-400/[0.06] p-6">
              <CheckIcon size={24} className="mt-0.5 shrink-0 text-success-400" />
              <div>
                <p className="font-semibold text-white">Tebex has confirmed your payment.</p>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">
                  A receipt has been sent by Tebex. Your scripts are granted to the Cfx.re account you logged in with
                  {completed.username ? (
                    <>
                      {' '}
                      (<span className="text-mist-200">{completed.username}</span>)
                    </>
                  ) : null}
                  .
                </p>
              </div>
            </div>
            <ul className="mt-8 divide-y divide-ink-700 rounded-lg border border-ink-700 bg-ink-900">
              {completed.packages.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 px-6 py-4 text-sm">
                  <span className="text-white">{item.name}</span>
                  <span className="tabular-nums text-mist-400">{formatPrice(item.in_basket?.price ?? 0, completed.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={site.links.cfxPortal}>
                Download from the Cfx.re Portal
                <ExternalIcon size={16} />
              </LinkButton>
              <LinkButton to="/docs/getting-started" variant="secondary">
                Installation guide
              </LinkButton>
            </div>
          </div>
        ) : (
          <Notice
            title="We couldn’t confirm a completed order from this browser"
            className="max-w-2xl"
            actions={
              <>
                <LinkButton to="/basket">View basket</LinkButton>
                <LinkButton to="/docs/getting-started" variant="secondary">
                  How delivery works
                </LinkButton>
              </>
            }
          >
            <p>
              If you finished paying, Tebex emails your receipt and your scripts appear in the Cfx.re Portal under the account you logged in with. It can take a
              moment for a payment to be confirmed.
            </p>
          </Notice>
        )}
      </Container>
    </>
  )
}
