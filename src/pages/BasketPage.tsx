import { BasketItems, BasketSummary } from '../components/basket/BasketContents'
import { LinkButton } from '../components/ui/Button'
import { Notice } from '../components/ui/feedback'
import { ExternalIcon } from '../components/ui/icons'
import { Container, PageHeader } from '../components/ui/layout'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBasket } from '../state/basket-context'

/** Full-page basket. Tebex also sends customers here when they leave checkout without paying. */
export default function BasketPage() {
  const basket = useBasket()
  usePageMeta('Basket')

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Your basket" description="Review your scripts, then complete payment on Tebex’s secure checkout." />
      <Container className="py-12 sm:py-16">
        {basket.enabled ? (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
              <BasketItems />
            </div>
            <aside className="h-fit rounded-lg border border-ink-700 bg-ink-900 p-6 lg:sticky lg:top-28">
              <BasketSummary />
            </aside>
          </div>
        ) : (
          <Notice
            title="The basket is not available yet"
            actions={
              <LinkButton to={site.links.store} variant="secondary">
                Open the official store
                <ExternalIcon size={16} />
              </LinkButton>
            }
          >
            Purchases on this site need the store connection to be configured. You can buy every script on the official MikeScripts store.
          </Notice>
        )}
      </Container>
    </>
  )
}
