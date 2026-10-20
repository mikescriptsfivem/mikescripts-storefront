/** Fixtures for unit tests only. Shapes mirror real Tebex Headless API responses. */
import type { TebexBasket, TebexCategory, TebexPackage } from './tebex/types'

export function makePackage(overrides: Partial<TebexPackage> & Pick<TebexPackage, 'id' | 'name'>): TebexPackage {
  const categoryId = overrides.category?.id ?? 10
  return {
    ident: `pkg_${categoryId}_${overrides.id}`,
    description: `<p>${overrides.name} description</p>`,
    image: null,
    type: 'single',
    category: { id: categoryId, name: 'Scripts' },
    base_price: 10,
    sales_tax: 0,
    total_price: 10,
    currency: 'USD',
    discount: 0,
    disable_quantity: false,
    disable_gifting: false,
    expiration_date: null,
    media: [],
    order: 0,
    slug: null,
    variables: [],
    created_at: '2026-01-01T00:00:00+00:00',
    updated_at: '2026-01-01T00:00:00+00:00',
    ...overrides,
  }
}

export function makeCategory(overrides: Partial<TebexCategory> & Pick<TebexCategory, 'id' | 'name'>): TebexCategory {
  return {
    slug: null,
    parent: null,
    description: '',
    packages: [],
    order: 0,
    display_type: 'grid',
    image_url: null,
    dynamic: false,
    tiered: false,
    ...overrides,
  }
}

export function makeBasket(overrides: Partial<TebexBasket> = {}): TebexBasket {
  return {
    ident: 'basket-1',
    complete: false,
    username: null,
    username_id: null,
    base_price: 0,
    sales_tax: 0,
    total_price: 0,
    currency: 'USD',
    packages: [],
    links: [],
    ...overrides,
  }
}
