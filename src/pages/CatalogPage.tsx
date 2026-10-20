import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ProductCard } from '../components/product/ProductCard'
import { StoreStatus } from '../components/StoreStatus'
import { Button } from '../components/ui/Button'
import { LoadingGrid, Notice } from '../components/ui/feedback'
import { ChevronDownIcon, SearchIcon } from '../components/ui/icons'
import { Container, PageHeader } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'
import { SORT_OPTIONS, filterProducts, isSortKey, sortProducts, type SortKey } from '../lib/catalog'
import { pluralize } from '../lib/format'
import { useCatalog } from '../state/catalog-context'

export default function CatalogPage() {
  const { status, catalog } = useCatalog()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const categorySlug = params.get('category')
  const sortParam = params.get('sort')
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'featured'
  const category = categorySlug ? (catalog?.categoryBySlug.get(categorySlug) ?? null) : null

  usePageMeta(category ? `${category.name} scripts` : 'All scripts', 'Browse every MikeScripts FiveM script with live pricing from Tebex.')

  const results = useMemo(() => {
    if (!catalog) return []
    return sortProducts(filterProducts(catalog, { query, categoryId: category?.id ?? null }), sort)
  }, [catalog, query, category, sort])

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const filterCategories = catalog?.categories.filter((item) => item.productIdents.length > 0 || catalog.categories.some((child) => child.parentId === item.id)) ?? []

  return (
    <>
      <PageHeader eyebrow="Catalogue" title={category ? category.name : 'All scripts'} description="Every MikeScripts release for FiveM. Prices are live from the official Tebex store." />
      <Container className="py-12 sm:py-16">
        {status === 'ready' && catalog ? (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="catalog-search" className="sr-only">
                  Search scripts
                </label>
                <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
                <input
                  id="catalog-search"
                  type="search"
                  value={query}
                  onChange={(event) => update('q', event.target.value || null)}
                  placeholder="Search by name"
                  autoComplete="off"
                  className="h-11 w-full rounded-md border border-ink-600 bg-ink-900 pl-10 pr-3 text-sm text-white placeholder:text-mist-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
              <div className="relative">
                <label htmlFor="catalog-sort" className="sr-only">
                  Sort scripts
                </label>
                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(event) => update('sort', event.target.value === 'featured' ? null : event.target.value)}
                  className="h-11 w-full appearance-none rounded-md border border-ink-600 bg-ink-900 pl-3 pr-10 text-sm text-white focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 lg:w-56"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mist-500" />
              </div>
            </div>

            {filterCategories.length > 1 ? (
              <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                  <CategoryFilterButton active={!category} onClick={() => update('category', null)}>
                    All
                  </CategoryFilterButton>
                  {filterCategories.map((item) => (
                    <CategoryFilterButton key={item.id} active={category?.id === item.id} onClick={() => update('category', item.slug)}>
                      {item.name}
                    </CategoryFilterButton>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-8 text-sm text-mist-500" aria-live="polite">
              {pluralize(results.length, 'script')}
              {query ? ` matching “${query}”` : ''}
            </p>

            {categorySlug && !category ? (
              <Notice title="That category no longer exists" className="mt-6" actions={<Button onClick={() => update('category', null)}>Show all scripts</Button>} />
            ) : results.length === 0 ? (
              <Notice
                title="No scripts match your search"
                className="mt-6"
                actions={
                  <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    Clear search and filters
                  </Button>
                }
              >
                Try a shorter name, or browse all categories.
              </Notice>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product, index) => (
                  <li key={product.ident}>
                    <ProductCard product={product} priority={index < 3} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : status === 'loading' ? (
          <LoadingGrid />
        ) : (
          <StoreStatus />
        )}
      </Container>
    </>
  )
}

function CategoryFilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 whitespace-nowrap rounded-md border px-4 text-sm font-medium transition-colors ${
        active ? 'border-accent-500 bg-accent-600/15 text-white' : 'border-ink-600 text-mist-300 hover:border-mist-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
