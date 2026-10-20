import { describe, expect, it } from 'vitest'
import type { ProductContent } from '../config/products'
import { productContent } from '../config/products'
import { site } from '../config/site'
import { buildCatalog, filterProducts, relatedProducts, resolveFeatured, shortProductName, sortProducts } from './catalog'
import { slugify } from './slug'
import { makeCategory, makePackage } from './test-fixtures'

const aviation = makeCategory({
  id: 1,
  name: 'Aviation',
  slug: 'aviation',
  order: 1,
  packages: [
    makePackage({ id: 11, name: 'MS8000 | Ultra-Long-Range Business Jet', category: { id: 1, name: 'Aviation' }, total_price: 30, order: 2, created_at: '2026-09-25T00:00:00Z' }),
    makePackage({ id: 12, name: 'MS_FlightSim', category: { id: 1, name: 'Aviation' }, total_price: 50, order: 1, created_at: '2026-06-01T00:00:00Z' }),
    makePackage({ id: 13, name: 'MS-100 + MS-E Bundle', category: { id: 1, name: 'Aviation' }, total_price: 60, order: 3 }),
    makePackage({ id: 14, name: 'MS-100 Walk-in Airliner', category: { id: 1, name: 'Aviation' }, total_price: 20, order: 4 }),
  ],
})
const vehicles = makeCategory({
  id: 2,
  name: 'Vehicle Systems',
  order: 2,
  packages: [makePackage({ id: 21, name: 'MS_Dyno', category: { id: 2, name: 'Vehicle Systems' }, total_price: 15, slug: 'ms-dyno-pro' })],
})
const tuning = makeCategory({
  id: 3,
  name: 'Tuning',
  order: 3,
  parent: { id: 2 },
  packages: [makePackage({ id: 31, name: 'MS_Handler', category: { id: 3, name: 'Tuning' }, total_price: 12 })],
})

const testContent: ProductContent[] = [
  { key: 'jet', match: { name: /(?<![a-z0-9])ms[\s_-]?8000(?![0-9])/i } },
  { key: 'sim', match: { name: /flight[\s_-]*sim/i, exclude: /(?<![a-z0-9])ms[\s_-]?e(?![a-z0-9])/i } },
  { key: 'airliner', match: { name: /(?<![a-z0-9])ms[\s_-]?100(?![0-9])/i, exclude: /bundle/i } },
  { key: 'fleet', match: { name: /(?<![a-z0-9])ms[\s_-]?e(?![a-z0-9])/i, exclude: /bundle/i } },
  { key: 'dyno', match: { name: /dyno/i } },
]

const catalog = buildCatalog([vehicles, aviation, tuning], testContent)

describe('buildCatalog', () => {
  it('orders products by category order, then package order', () => {
    expect(catalog.products.map((product) => product.id)).toEqual([12, 11, 13, 14, 21, 31])
  })

  it('builds unique slugs, preferring the Tebex slug', () => {
    expect(catalog.byId.get(21)?.slug).toBe('ms-dyno-pro')
    expect(catalog.byId.get(12)?.slug).toBe('ms-flightsim')
    expect(catalog.byId.get(11)?.slug).toBe('ms8000-ultra-long-range-business-jet')
    expect(catalog.categoryById.get(2)?.slug).toBe('vehicle-systems')
  })

  it('uses a slug from local content and drops framework tags from generated slugs', () => {
    const tagged = makeCategory({
      id: 5,
      name: 'Packages',
      packages: [
        makePackage({ id: 51, name: '[ESX, QBOX, QBCORE] Police Helicopter System | Camera', category: { id: 5, name: 'Packages' } }),
        makePackage({ id: 52, name: 'MS8000 | Jet', category: { id: 5, name: 'Packages' } }),
      ],
    })
    const result = buildCatalog([tagged], [{ key: 'jet', tebex: { ident: 'pkg_5_52' }, slug: 'ms8000' }])
    expect(result.byId.get(51)?.slug).toBe('police-helicopter-system-camera')
    expect(result.byId.get(52)?.slug).toBe('ms8000')
  })

  it('derives short display names, with an override from local content', () => {
    expect(shortProductName('[ESX, QBOX, QBCORE] All-In-One Flight Simulator (v4.5.0)')).toBe('All-In-One Flight Simulator')
    expect(shortProductName('MS8000 | Ultra-Long-Range Luxury Business Jet | Walkable Cabin')).toBe('MS8000')
    expect(shortProductName('ms_balloon — Hot Air Balloon for FiveM')).toBe('ms_balloon')
    expect(shortProductName('MS Flight - Air Traffic Control Tower (LSIA)')).toBe('MS Flight - Air Traffic Control Tower')
    const result = buildCatalog([aviation], [{ key: 'jet', tebex: { ident: 'pkg_1_11' }, shortName: 'The Jet' }])
    expect(result.byId.get(11)?.title).toBe('The Jet')
    expect(result.byId.get(14)?.title).toBe('MS-100 Walk-in Airliner')
  })

  it('matches local content by name pattern and skips bundles', () => {
    expect(catalog.byContentKey.get('airliner')?.id).toBe(14)
    expect(catalog.byContentKey.get('jet')?.id).toBe(11)
    expect(catalog.byContentKey.get('sim')?.id).toBe(12)
    expect(catalog.byId.get(13)?.content).toBeNull()
  })

  it('matches underscore-style resource names', () => {
    const names = makeCategory({
      id: 9,
      name: 'Scripts',
      packages: [
        makePackage({ id: 91, name: 'MS_FlightSim_MSE', category: { id: 9, name: 'Scripts' }, order: 1 }),
        makePackage({ id: 92, name: 'MS_FlightSim', category: { id: 9, name: 'Scripts' }, order: 2 }),
        makePackage({ id: 94, name: 'MS-1000 Something Else', category: { id: 9, name: 'Scripts' }, order: 4 }),
      ],
    })
    const result = buildCatalog([names, vehicles], testContent)
    expect(result.byContentKey.get('fleet')?.id).toBe(91)
    expect(result.byContentKey.get('sim')?.id).toBe(92)
    expect(result.byContentKey.get('dyno')?.id).toBe(21)
    expect(result.byContentKey.has('airliner')).toBe(false)
  })

  it('prefers pinned identifiers over name patterns', () => {
    const pinned: ProductContent[] = [{ key: 'pinned', tebex: { ident: 'pkg_1_13' }, match: { name: /MS-100/ } }]
    const result = buildCatalog([aviation], pinned)
    expect(result.byContentKey.get('pinned')?.id).toBe(13)
  })

  it('groups products into storefront categories, with an "Other scripts" fallback', () => {
    const result = buildCatalog([vehicles, aviation, tuning], testContent, [
      { name: 'Flight', slug: 'flight', products: ['sim', 'jet', 'airliner'] },
      { name: 'Garage', products: ['dyno'] },
      { name: 'Empty', products: ['nothing'] },
    ])
    expect(result.categories.map((category) => [category.name, category.slug, category.productIdents.length])).toEqual([
      ['Flight', 'flight', 3],
      ['Garage', 'garage', 1],
      ['Other scripts', 'other', 2],
    ])
    expect(result.products.map((product) => product.id)).toEqual([12, 11, 14, 21, 13, 31])
    expect(result.byId.get(12)?.categoryName).toBe('Flight')
    expect(filterProducts(result, { categoryId: result.categoryBySlug.get('flight')!.id }).map((p) => p.id)).toEqual([12, 11, 14])
  })

  it('reads the first Tebex video', () => {
    const withVideo = makeCategory({
      id: 7,
      name: 'Packages',
      packages: [makePackage({ id: 71, name: 'Sim', category: { id: 7, name: 'Packages' }, media: [{ type: 'image', url: 'https://x/a.png' }, { type: 'video', url: 'https://youtu.be/EXTJy9Ej5Gk' }] })],
    })
    expect(buildCatalog([withVideo], []).byId.get(71)?.videoUrl).toBe('https://youtu.be/EXTJy9Ej5Gk')
  })

  it('uses the summary from the description when no override exists', () => {
    expect(catalog.byId.get(21)?.summary).toBe('MS_Dyno description')
  })
})

describe('live configuration', () => {
  it('has unique keys, pinned idents and slugs', () => {
    const keys = productContent.map((entry) => entry.key)
    const idents = productContent.map((entry) => entry.tebex?.ident).filter(Boolean)
    const slugs = productContent.map((entry) => entry.slug).filter(Boolean)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(idents).size).toBe(idents.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('only references existing product keys from site.ts', () => {
    const keys = new Set(productContent.map((entry) => entry.key))
    const referenced = [...site.featuredProducts, site.featuredRelease, ...site.about.pillars.map((pillar) => pillar.productKey), ...site.categories.flatMap((category) => category.products)]
    expect(referenced.filter((key) => !keys.has(key))).toEqual([])
  })
})

describe('filterProducts', () => {
  it('searches by name, ignoring punctuation and case', () => {
    expect(filterProducts(catalog, { query: 'ms 8000' }).map((p) => p.id)).toEqual([11])
    expect(filterProducts(catalog, { query: 'flightsim' }).map((p) => p.id)).toEqual([12])
    expect(filterProducts(catalog, { query: 'MS-100' }).map((p) => p.id)).toEqual([13, 14])
  })

  it('includes sub-categories when filtering by a parent category', () => {
    expect(filterProducts(catalog, { categoryId: 2 }).map((p) => p.id)).toEqual([21, 31])
    expect(filterProducts(catalog, { categoryId: 3 }).map((p) => p.id)).toEqual([31])
  })
})

describe('sortProducts', () => {
  it('sorts by price and recency', () => {
    expect(sortProducts(catalog.products, 'price-asc')[0]?.id).toBe(31)
    expect(sortProducts(catalog.products, 'price-desc')[0]?.id).toBe(13)
    expect(sortProducts(catalog.products, 'newest')[0]?.id).toBe(11)
  })
})

describe('featured and related', () => {
  it('puts flagship keys first, skips unknown keys, then fills in order', () => {
    const featured = resolveFeatured(catalog, ['jet', 'does-not-exist', 'sim'], 4)
    expect(featured.map((p) => p.id)).toEqual([11, 12, 13, 14])
  })

  it('relates products from the same category first', () => {
    expect(relatedProducts(catalog, catalog.byId.get(21)!, 2).map((p) => p.id)).toEqual([12, 11])
    expect(relatedProducts(catalog, catalog.byId.get(12)!, 3).map((p) => p.id)).toEqual([11, 13, 14])
  })
})

describe('slugify', () => {
  it('produces URL-safe slugs', () => {
    expect(slugify('MS_FlightSim | Aviation')).toBe('ms-flightsim-aviation')
    expect(slugify('Ça Marche!')).toBe('ca-marche')
    expect(slugify('  ')).toBe('')
  })
})
