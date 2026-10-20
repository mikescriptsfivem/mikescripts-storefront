import type { ProductContent } from '../config/products'
import { summaryFromHtml } from './html'
import { slugify, uniqueSlugs } from './slug'
import type { TebexCategory, TebexPackage, TebexPackageMedia } from './tebex/types'

export interface Price {
  /** What the customer pays (Tebex total_price). */
  amount: number
  base: number
  tax: number
  discount: number
  currency: string
}

export interface Product {
  ident: string
  id: number
  /** Route segment for /scripts/:slug. */
  slug: string
  /** Full Tebex package name. */
  name: string
  /** Short display name for cards and headings (products.ts `shortName`, or derived from the Tebex name). */
  title: string
  descriptionHtml: string
  summary: string
  categoryId: number
  categoryName: string
  price: Price
  /** "single", "subscription" or "both". */
  type: string
  image: string | null
  media: TebexPackageMedia[]
  /** First video from the Tebex package media (usually a YouTube link). */
  videoUrl: string | null
  /** The package asks for customer input this site cannot collect, so it is bought on the Tebex store. */
  requiresInput: boolean
  createdAt: string
  content: ProductContent | null
}

export interface CatalogCategory {
  id: number
  name: string
  slug: string
  description: string
  parentId: number | null
  imageUrl: string | null
  /** Products directly in this category, in display order. */
  productIdents: string[]
}

/**
 * A storefront category defined in site.ts. Used instead of the Tebex categories when configured.
 * `products` lists product keys from products.ts (or raw Tebex idents).
 */
export interface StoreCategory {
  name: string
  slug?: string
  description?: string
  products: string[]
}

export interface Catalog {
  products: Product[]
  categories: CatalogCategory[]
  byIdent: Map<string, Product>
  byId: Map<number, Product>
  bySlug: Map<string, Product>
  byContentKey: Map<string, Product>
  categoryBySlug: Map<string, CatalogCategory>
  categoryById: Map<number, CatalogCategory>
}

function matchesPinned(content: ProductContent, pkg: TebexPackage): boolean {
  const pin = content.tebex
  if (!pin) return false
  return (
    (pin.ident !== undefined && pin.ident === pkg.ident) ||
    (pin.id !== undefined && pin.id === pkg.id) ||
    (pin.slug !== undefined && pkg.slug !== null && pin.slug === pkg.slug)
  )
}

function matchesName(content: ProductContent, pkg: TebexPackage): boolean {
  const rule = content.match
  if (!rule) return false
  return rule.name.test(pkg.name) && !(rule.exclude?.test(pkg.name) ?? false)
}

/** Links local content entries to packages: pinned identifiers first, then name patterns in catalogue order. */
export function assignContent(packages: TebexPackage[], contents: ProductContent[]): Map<string, ProductContent> {
  const byIdent = new Map<string, ProductContent>()
  const usedKeys = new Set<string>()

  for (const content of contents) {
    const pkg = packages.find((candidate) => !byIdent.has(candidate.ident) && matchesPinned(content, candidate))
    if (pkg) {
      byIdent.set(pkg.ident, content)
      usedKeys.add(content.key)
    }
  }
  for (const content of contents) {
    if (usedKeys.has(content.key) || content.tebex?.ident || content.tebex?.id) continue
    const pkg = packages.find((candidate) => !byIdent.has(candidate.ident) && matchesName(content, candidate))
    if (pkg) {
      byIdent.set(pkg.ident, content)
      usedKeys.add(content.key)
    }
  }
  return byIdent
}

function packageImage(pkg: TebexPackage): string | null {
  if (pkg.image) return pkg.image
  const images = (pkg.media ?? []).filter((item) => item.type === 'image' && item.url)
  return (images.find((item) => item.primary) ?? images[0])?.url ?? null
}

function byOrder<T extends { order: number; id: number }>(a: T, b: T): number {
  return (a.order ?? 0) - (b.order ?? 0) || a.id - b.id
}

/** "[ESX, QBOX, QBCORE] Police Helicopter System" → "Police Helicopter System" (for URLs only). */
function nameForSlug(name: string): string {
  return name.replace(/^\s*(\[[^\]]*\]\s*)+/, '')
}

/**
 * Short display name from a Tebex name: leading framework tags and everything after " | ", " — " or "(" removed.
 * "[ESX, QBOX, QBCORE] All-In-One Flight Simulator (v4.5.0)" → "All-In-One Flight Simulator".
 */
export function shortProductName(name: string): string {
  const short = nameForSlug(name)
    .split(/\s+[|—–]\s+|\s*\(/)[0]
    ?.trim()
  return short && short.length >= 3 ? short : name.trim()
}

const OTHER_CATEGORY_ID = -1000

interface Entry {
  pkg: TebexPackage
  category: TebexCategory
  content: ProductContent | undefined
}

export function buildCatalog(rawCategories: TebexCategory[], contents: ProductContent[], storeCategories: StoreCategory[] = []): Catalog {
  const sortedCategories = [...rawCategories].filter((category) => !category.dynamic).sort(byOrder)

  // Packages in Tebex order (category order, then package order), without duplicates.
  const seen = new Set<string>()
  const tebexOrder: { pkg: TebexPackage; category: TebexCategory }[] = []
  for (const category of sortedCategories) {
    for (const pkg of [...(category.packages ?? [])].sort(byOrder)) {
      if (!pkg?.ident || seen.has(pkg.ident)) continue
      seen.add(pkg.ident)
      tebexOrder.push({ pkg, category })
    }
  }

  const contentByIdent = assignContent(
    tebexOrder.map(({ pkg }) => pkg),
    contents,
  )
  let entries: Entry[] = tebexOrder.map((entry) => ({ ...entry, content: contentByIdent.get(entry.pkg.ident) }))

  // Where each product is listed: storefront categories from site.ts if configured, otherwise Tebex categories.
  const placement = new Map<Entry, { id: number; name: string }>()
  let categories: CatalogCategory[]
  if (storeCategories.length > 0) {
    const groupOf = new Map<string, number>()
    storeCategories.forEach((group, index) => group.products.forEach((ref) => groupOf.has(ref) || groupOf.set(ref, index)))
    const groupIndex = (entry: Entry) => groupOf.get(entry.content?.key ?? '') ?? groupOf.get(entry.pkg.ident) ?? storeCategories.length
    entries = entries.map((entry, order) => ({ entry, order })).sort((a, b) => groupIndex(a.entry) - groupIndex(b.entry) || a.order - b.order).map(({ entry }) => entry)
    const groups = [...storeCategories, { name: 'Other scripts', slug: 'other', products: [] }]
    for (const entry of entries) {
      const index = groupIndex(entry)
      placement.set(entry, { id: index === storeCategories.length ? OTHER_CATEGORY_ID : -(index + 1), name: groups[index]?.name ?? 'Other scripts' })
    }
    categories = groups
      .map((group, index) => {
        const id = index === storeCategories.length ? OTHER_CATEGORY_ID : -(index + 1)
        return {
          id,
          name: group.name,
          slug: group.slug || slugify(group.name) || String(Math.abs(id)),
          description: group.description ?? '',
          parentId: null,
          imageUrl: null,
          productIdents: entries.filter((entry) => placement.get(entry)?.id === id).map((entry) => entry.pkg.ident),
        }
      })
      .filter((category) => category.productIdents.length > 0)
  } else {
    for (const entry of entries) placement.set(entry, { id: entry.category.id, name: entry.category.name })
    const categorySlugs = uniqueSlugs(sortedCategories, (category) => ({ preferred: category.slug, name: category.name, id: category.id }))
    categories = sortedCategories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: categorySlugs.get(category) ?? String(category.id),
      description: category.description ?? '',
      parentId: category.parent?.id ?? null,
      imageUrl: category.image_url,
      productIdents: entries.filter((entry) => entry.category.id === category.id).map((entry) => entry.pkg.ident),
    }))
  }

  // Slugs from products.ts win, then the Tebex slug, then the name.
  const slugOrder = [...entries.filter((entry) => entry.content?.slug), ...entries.filter((entry) => !entry.content?.slug)]
  const productSlugs = uniqueSlugs(slugOrder, ({ pkg, content }) => ({
    preferred: content?.slug ?? pkg.slug,
    name: nameForSlug(pkg.name),
    id: pkg.id,
  }))

  const products: Product[] = entries.map((entry) => {
    const { pkg, content } = entry
    const place = placement.get(entry) ?? { id: entry.category.id, name: entry.category.name }
    return {
      ident: pkg.ident,
      id: pkg.id,
      slug: productSlugs.get(entry) ?? String(pkg.id),
      name: pkg.name,
      title: content?.shortName ?? shortProductName(pkg.name),
      descriptionHtml: pkg.description ?? '',
      summary: content?.summary ?? summaryFromHtml(pkg.description ?? ''),
      categoryId: place.id,
      categoryName: place.name,
      price: {
        amount: Number(pkg.total_price) || 0,
        base: Number(pkg.base_price) || 0,
        tax: Number(pkg.sales_tax) || 0,
        discount: Number(pkg.discount) || 0,
        currency: pkg.currency,
      },
      type: pkg.type,
      image: packageImage(pkg),
      media: (pkg.media ?? []).filter((item) => Boolean(item.url)),
      videoUrl: (pkg.media ?? []).find((item) => item.type === 'video' && item.url)?.url ?? null,
      requiresInput: Array.isArray(pkg.variables) && pkg.variables.length > 0,
      createdAt: pkg.created_at,
      content: content ?? null,
    }
  })

  const byContentKey = new Map<string, Product>()
  for (const product of products) {
    if (product.content) byContentKey.set(product.content.key, product)
  }

  return {
    products,
    categories,
    byIdent: new Map(products.map((product) => [product.ident, product])),
    byId: new Map(products.map((product) => [product.id, product])),
    bySlug: new Map(products.map((product) => [product.slug, product])),
    byContentKey,
    categoryBySlug: new Map(categories.map((category) => [category.slug, category])),
    categoryById: new Map(categories.map((category) => [category.id, category])),
  }
}

/** The category plus all of its sub-categories. */
export function categoryFamily(catalog: Catalog, categoryId: number): Set<number> {
  const family = new Set([categoryId])
  let grew = true
  while (grew) {
    grew = false
    for (const category of catalog.categories) {
      if (category.parentId !== null && family.has(category.parentId) && !family.has(category.id)) {
        family.add(category.id)
        grew = true
      }
    }
  }
  return family
}

/** Number of products in a category including its sub-categories. */
export function categoryProductCount(catalog: Catalog, categoryId: number): number {
  const family = categoryFamily(catalog, categoryId)
  return catalog.products.filter((product) => family.has(product.categoryId)).length
}

export type SortKey = 'featured' | 'name' | 'price-asc' | 'price-desc' | 'newest'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Search by name (and summary/category), restricted to a category family. Keeps the input order. */
export function filterProducts(catalog: Catalog, { query = '', categoryId = null as number | null } = {}): Product[] {
  const family = categoryId === null ? null : categoryFamily(catalog, categoryId)
  const terms = normalize(query).split(' ').filter(Boolean)
  return catalog.products.filter((product) => {
    if (family && !family.has(product.categoryId)) return false
    if (terms.length === 0) return true
    const name = normalize(product.name)
    const compactName = name.replace(/ /g, '')
    const haystack = `${name} ${compactName} ${normalize(product.summary)} ${normalize(product.categoryName)}`
    return terms.every((term) => haystack.includes(term))
  })
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products]
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }))
    case 'price-asc':
      return list.sort((a, b) => a.price.amount - b.price.amount)
    case 'price-desc':
      return list.sort((a, b) => b.price.amount - a.price.amount)
    case 'newest':
      return list.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
    case 'featured':
      return list
  }
}

/** Flagship products first (by content key), then other live products in display order. */
export function resolveFeatured(catalog: Catalog, keys: readonly string[], count: number): Product[] {
  const picked: Product[] = []
  for (const key of keys) {
    const product = catalog.byContentKey.get(key)
    if (product && !picked.includes(product)) picked.push(product)
  }
  for (const product of catalog.products) {
    if (picked.length >= count) break
    if (!picked.includes(product)) picked.push(product)
  }
  return picked.slice(0, count)
}

/** Products from the same category first, then others, excluding the current product. */
export function relatedProducts(catalog: Catalog, product: Product, count = 3): Product[] {
  const sameCategory = catalog.products.filter((item) => item.ident !== product.ident && item.categoryId === product.categoryId)
  const others = catalog.products.filter((item) => item.ident !== product.ident && item.categoryId !== product.categoryId)
  return [...sameCategory, ...others].slice(0, count)
}
