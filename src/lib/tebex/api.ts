import { TebexError, tebexRequest } from './client'
import type { TebexAuthMethod, TebexBasket, TebexCategory, TebexCmsPage, TebexWebstore } from './types'

/**
 * Tebex Headless API endpoints used by the storefront.
 * Docs: https://docs.tebex.io/developers/headless-api/endpoints
 *
 * - Store and basket endpoints live under /api/accounts/{publicToken}.
 * - Package add/remove endpoints live under /api/baskets/{basketIdent} and need no token.
 * Only the PUBLIC token is used. Nothing here requires (or may ever use) the private key.
 */
export const HEADLESS_API_URL = 'https://headless.tebex.io/api'

export interface CreateBasketOptions {
  /** Where Tebex sends the customer after a completed payment. */
  completeUrl: string
  /** Where Tebex sends the customer if they leave checkout. */
  cancelUrl: string
}

interface DataEnvelope<T> {
  data: T
}

function unwrap<T>(envelope: DataEnvelope<T>): T {
  if (!envelope || typeof envelope !== 'object' || !('data' in envelope)) {
    throw new TebexError('invalid-response', 'Tebex returned an unexpected response. Please try again.')
  }
  return envelope.data
}

function isAuthMethod(value: unknown): value is TebexAuthMethod {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.name === 'string' && typeof candidate.url === 'string' && candidate.url.startsWith('https://')
}

/** The auth endpoint has been seen returning `[...]`, `{ data: [...] }` and nested `[[]]`. */
export function parseAuthMethods(payload: unknown): TebexAuthMethod[] {
  const list =
    Array.isArray(payload) ? payload
    : typeof payload === 'object' && payload !== null && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : []
  return list.flat(2).filter(isAuthMethod)
}

/** True when the URL is an HTTPS page on tebex.io (for example https://pay.tebex.io/…). */
export function isTebexUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'tebex.io' || url.hostname.endsWith('.tebex.io'))
  } catch {
    return false
  }
}

/** The genuine Tebex checkout URL for a basket, or null if Tebex has not provided one. */
export function getCheckoutUrl(basket: TebexBasket): string | null {
  const links = basket.links
  if (!links || Array.isArray(links)) return null
  const checkout = links.checkout
  return typeof checkout === 'string' && isTebexUrl(checkout) ? checkout : null
}

/** A basket is authorised once Tebex has attached the customer's account to it. */
export function isBasketAuthorized(basket: TebexBasket | null): boolean {
  if (!basket) return false
  return Boolean(basket.username) || (basket.username_id !== null && basket.username_id !== undefined && basket.username_id !== '')
}

export function createTebexApi(publicToken: string) {
  const token = encodeURIComponent(publicToken)
  const account = (path: string) => `${HEADLESS_API_URL}/accounts/${token}${path}`
  const basketPath = (basketIdent: string, path: string) =>
    `${HEADLESS_API_URL}/baskets/${encodeURIComponent(basketIdent)}${path}`

  return {
    getWebstore(signal?: AbortSignal) {
      return tebexRequest<DataEnvelope<TebexWebstore>>(account(''), { signal }).then(unwrap)
    },

    getCategoriesWithPackages(signal?: AbortSignal) {
      return tebexRequest<DataEnvelope<TebexCategory[]>>(account('/categories?includePackages=1'), { signal }).then(unwrap)
    },

    getPages(signal?: AbortSignal) {
      return tebexRequest<DataEnvelope<TebexCmsPage[]>>(account('/pages'), { signal }).then(unwrap)
    },

    createBasket({ completeUrl, cancelUrl }: CreateBasketOptions) {
      return tebexRequest<DataEnvelope<TebexBasket>>(account('/baskets'), {
        method: 'POST',
        body: { complete_url: completeUrl, cancel_url: cancelUrl, complete_auto_redirect: true },
      }).then(unwrap)
    },

    getBasket(basketIdent: string) {
      return tebexRequest<DataEnvelope<TebexBasket>>(account(`/baskets/${encodeURIComponent(basketIdent)}`)).then(unwrap)
    },

    /** Login options for the basket. The customer is redirected to one and returns to `returnUrl`. */
    getBasketAuthMethods(basketIdent: string, returnUrl: string) {
      const query = `?returnUrl=${encodeURIComponent(returnUrl)}`
      return tebexRequest<unknown>(account(`/baskets/${encodeURIComponent(basketIdent)}/auth${query}`)).then(parseAuthMethods)
    },

    /** `packageId` should be the package `ident` exactly as Tebex returned it. */
    addPackage(basketIdent: string, packageId: string, quantity = 1) {
      return tebexRequest<DataEnvelope<TebexBasket>>(basketPath(basketIdent, '/packages'), {
        method: 'POST',
        body: { package_id: packageId, quantity },
      }).then(unwrap)
    },

    removePackage(basketIdent: string, packageId: string) {
      return tebexRequest<DataEnvelope<TebexBasket>>(basketPath(basketIdent, '/packages/remove'), {
        method: 'POST',
        body: { package_id: packageId },
      }).then(unwrap)
    },
  }
}

export type TebexApi = ReturnType<typeof createTebexApi>
