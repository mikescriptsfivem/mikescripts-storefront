import { Link } from 'react-router'
import { categoryProductCount, type Catalog, type CatalogCategory } from '../../lib/catalog'
import { pluralize } from '../../lib/format'
import { ArrowRightIcon } from '../ui/icons'
import { RemoteImage } from '../ui/Picture'

function categoryImage(catalog: Catalog, category: CatalogCategory): string | null {
  if (category.imageUrl) return category.imageUrl
  const firstIdent = category.productIdents[0]
  return (firstIdent ? catalog.byIdent.get(firstIdent)?.image : null) ?? null
}

/** Category tiles linking to the filtered catalogue. */
export function CategoryTiles({ catalog, categories }: { catalog: Catalog; categories: CatalogCategory[] }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${categories.length === 2 || categories.length === 4 ? '' : 'lg:grid-cols-3'}`}>
      {categories.map((category) => {
        const count = categoryProductCount(catalog, category.id)
        return (
          <li key={category.id}>
            <Link
              to={`/scripts?category=${encodeURIComponent(category.slug)}`}
              className="group relative isolate flex aspect-[16/9] flex-col justify-end overflow-hidden rounded-lg border border-ink-700 p-6 transition-colors hover:border-ink-500"
            >
              <RemoteImage
                src={categoryImage(catalog, category)}
                alt=""
                fallbackLabel={category.name}
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-300">{pluralize(count, 'script')}</span>
              <span className="mt-1 flex items-center justify-between gap-3 font-display text-3xl font-semibold uppercase tracking-wide text-white">
                {category.name}
                <ArrowRightIcon size={20} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
