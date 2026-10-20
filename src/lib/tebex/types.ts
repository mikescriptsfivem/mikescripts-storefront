/**
 * Response shapes from the Tebex Headless API.
 * Source: https://docs.tebex.io/developers/headless-api and the official OpenAPI schema
 * (github.com/tebexio/TebexHeadless-OpenAPI), adjusted to what the live API actually returns.
 */

export interface TebexWebstore {
  id: number
  name: string
  description: string
  webstore_url: string
  currency: string
  lang: string
  logo: string | null
  platform_type: string
  platform_type_id: string | number
  created_at: string
}

export interface TebexPackageMedia {
  type: string
  name?: string
  url: string
  featured?: boolean
  primary?: boolean
}

export interface TebexPackage {
  id: number
  /** Opaque identifier (e.g. "pkg_12_456"). Always use this for basket operations. */
  ident: string
  name: string
  /** HTML authored in the Tebex panel. Must be sanitised before rendering. */
  description: string
  image: string | null
  /** "single", "subscription" or "both". */
  type: string
  category: { id: number; name: string }
  base_price: number
  sales_tax: number
  total_price: number
  currency: string
  discount: number
  disable_quantity: boolean
  disable_gifting: boolean
  expiration_date: string | null
  media?: TebexPackageMedia[]
  order: number
  /** Often null. */
  slug: string | null
  user_limit?: number
  /** Customer input fields required at purchase time. */
  variables?: unknown[]
  created_at: string
  updated_at: string
}

export interface TebexCategory {
  id: number
  name: string
  slug: string | null
  parent: { id: number; name?: string } | null
  description: string
  packages?: TebexPackage[] | null
  order: number
  display_type: string
  image_url: string | null
  dynamic?: boolean
  tiered?: boolean
}

export interface TebexBasketPackage {
  id: number
  name: string
  description?: string
  image?: string | null
  slug?: string | null
  in_basket: { quantity: number; price: number }
  type?: string
}

export interface TebexBasketLinks {
  checkout?: string
  payment?: string
}

export interface TebexBasket {
  ident: string
  id?: number
  complete: boolean
  email?: string | null
  username: string | null
  username_id: string | number | null
  country?: string
  base_price: number
  sales_tax: number
  total_price: number
  currency: string
  packages: TebexBasketPackage[]
  /** An object once a checkout link exists, an empty array otherwise. */
  links: TebexBasketLinks | unknown[]
}

export interface TebexAuthMethod {
  name: string
  url: string
}

export interface TebexCmsPage {
  id: number
  title: string
  slug: string
  private?: boolean
  hidden?: boolean
  disabled?: boolean
  content: string
}

/** A sidebar module configured in the Tebex panel (Webstore → Sidebar). */
export interface TebexSidebarModule {
  id: number
  type: string
  data: unknown
}

/** A real recent buyer from the Recent Payments sidebar module (Tebex shares no product or time here). */
export interface RecentCustomer {
  username: string
  avatarUrl: string | null
}

export interface TebexProblem {
  status?: number
  title?: string
  detail?: string
  error_code?: string
}
