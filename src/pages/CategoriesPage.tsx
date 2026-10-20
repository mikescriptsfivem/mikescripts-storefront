import { CategoryTiles } from '../components/home/CategoryTiles'
import { StoreStatus } from '../components/StoreStatus'
import { Notice, Skeleton } from '../components/ui/feedback'
import { Container, PageHeader } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCatalog } from '../state/catalog-context'

export default function CategoriesPage() {
  const { status, catalog } = useCatalog()
  usePageMeta('Categories', 'Browse MikeScripts FiveM scripts by category.')
  const categories = catalog?.categories.filter((category) => category.productIdents.length > 0 || catalog.categories.some((child) => child.parentId === category.id)) ?? []

  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Categories" description="Every category comes straight from the official MikeScripts Tebex store." />
      <Container className="py-12 sm:py-16">
        {status === 'ready' && catalog ? (
          categories.length > 0 ? (
            <CategoryTiles catalog={catalog} categories={categories} />
          ) : (
            <Notice title="No categories yet">Categories appear here once scripts are listed on the store.</Notice>
          )
        ) : status === 'loading' ? (
          <div role="status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">Loading categories…</span>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="aspect-[16/9] rounded-lg" />
            ))}
          </div>
        ) : (
          <StoreStatus />
        )}
      </Container>
    </>
  )
}
