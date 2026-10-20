import { useMemo } from 'react'
import { site } from '../../config/site'
import { resolveFeatured } from '../../lib/catalog'
import { useCatalog } from '../../state/catalog-context'
import { ProductCard } from '../product/ProductCard'
import { StoreStatus } from '../StoreStatus'
import { LoadingGrid, Notice } from '../ui/feedback'
import { Container, SectionHeading } from '../ui/layout'
import { Reveal } from '../ui/Reveal'

export function FeaturedProducts() {
  const { status, catalog } = useCatalog()
  const products = useMemo(
    () => (catalog ? resolveFeatured(catalog, site.featuredProducts, site.featuredProductCount) : []),
    [catalog],
  )
  const [first, second, ...rest] = products

  return (
    <section aria-labelledby="featured-heading" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          id="featured-heading"
          eyebrow="Featured scripts"
          title="Flagship releases"
          description="Hand-picked systems from the MikeScripts catalogue, with live pricing from the official store."
          action={{ label: 'View all scripts', to: '/scripts' }}
        />
        <div className="mt-12">
          {status === 'loading' ? <LoadingGrid count={3} /> : null}
          {status === 'unconfigured' || status === 'error' ? <StoreStatus /> : null}
          {status === 'ready' && products.length === 0 ? (
            <Notice title="No scripts are listed yet">New releases will appear here as soon as they are live on the store.</Notice>
          ) : null}
          {status === 'ready' && first ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Reveal>
                  <ProductCard product={first} variant="feature" />
                </Reveal>
                {second ? (
                  <Reveal delay={80}>
                    <ProductCard product={second} variant="feature" />
                  </Reveal>
                ) : null}
              </div>
              {rest.length > 0 ? (
                <div className={`grid gap-6 sm:grid-cols-2 ${rest.length === 4 ? 'lg:grid-cols-4' : rest.length === 2 ? '' : 'lg:grid-cols-3'}`}>
                  {rest.map((product, index) => (
                    <Reveal key={product.ident} delay={index * 60}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
