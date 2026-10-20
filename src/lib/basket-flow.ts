import { getCheckoutUrl, isBasketAuthorized, type CreateBasketOptions, type TebexApi } from './tebex/api'
import { TebexError } from './tebex/client'
import type { TebexAuthMethod, TebexBasket } from './tebex/types'

/**
 * The Tebex basket workflow, kept free of React so it can be unit tested:
 *   create basket → customer logs in (redirect) → add package by ident → redirect to links.checkout.
 * Docs: https://docs.tebex.io/developers/headless-api/guides/baskets
 */

type BasketApi = Pick<TebexApi, 'getBasket' | 'createBasket' | 'getBasketAuthMethods' | 'addPackage'>

/** Tebex answers 404 (or 422 for a malformed ident) once a basket has expired or never existed. */
export function isMissingBasketError(error: unknown): boolean {
  return error instanceof TebexError && (error.status === 404 || error.status === 410 || error.status === 422)
}

export interface LoadedBasket {
  /** The basket if it can still be used. */
  basket: TebexBasket | null
  /** Set when the basket has already been paid for. */
  completed: TebexBasket | null
}

export async function loadBasket(api: Pick<TebexApi, 'getBasket'>, ident: string): Promise<LoadedBasket> {
  try {
    const basket = await api.getBasket(ident)
    return basket.complete ? { basket: null, completed: basket } : { basket, completed: null }
  } catch (error) {
    if (isMissingBasketError(error)) return { basket: null, completed: null }
    throw error
  }
}

/** The current basket if it is still open, otherwise a brand-new one. */
export async function ensureBasket(api: BasketApi, currentIdent: string | null, urls: CreateBasketOptions): Promise<TebexBasket> {
  if (currentIdent) {
    const { basket } = await loadBasket(api, currentIdent)
    if (basket) return basket
  }
  return api.createBasket(urls)
}

export function basketHasPackage(basket: TebexBasket | null, packageId: number): boolean {
  return Boolean(basket?.packages.some((item) => item.id === packageId))
}

export function basketItemCount(basket: TebexBasket | null): number {
  return basket?.packages.reduce((total, item) => total + (item.in_basket?.quantity ?? 1), 0) ?? 0
}

export type AddResult =
  | { kind: 'added'; basket: TebexBasket }
  | { kind: 'already-in-basket'; basket: TebexBasket }
  | { kind: 'login-required'; basket: TebexBasket; methods: TebexAuthMethod[] }

export interface AddRequest {
  currentIdent: string | null
  product: { ident: string; id: number }
  urls: CreateBasketOptions
  /** Where Tebex returns the customer after logging in. */
  returnUrl: string
}

const LOGIN_REQUIRED = /log\s?in/i

export async function addToBasketFlow(api: BasketApi, request: AddRequest): Promise<AddResult> {
  const basket = await ensureBasket(api, request.currentIdent, request.urls)

  // Scripts are single licences: adding again would only raise the quantity.
  if (basketHasPackage(basket, request.product.id)) return { kind: 'already-in-basket', basket }

  if (!isBasketAuthorized(basket)) {
    const methods = await api.getBasketAuthMethods(basket.ident, request.returnUrl)
    if (methods.length > 0) return { kind: 'login-required', basket, methods }
  }

  try {
    const updated = await api.addPackage(basket.ident, request.product.ident, 1)
    return { kind: 'added', basket: updated }
  } catch (error) {
    if (error instanceof TebexError && error.status === 422 && LOGIN_REQUIRED.test(error.message)) {
      throw new TebexError(
        'http',
        'Tebex needs you to log in before adding scripts, but no login option is available right now. Please try again shortly.',
        422,
      )
    }
    throw error
  }
}

export type CheckoutResult =
  | { kind: 'redirect'; basket: TebexBasket; url: string }
  | { kind: 'login-required'; basket: TebexBasket; methods: TebexAuthMethod[] }
  | { kind: 'empty'; basket: TebexBasket | null }

export async function checkoutFlow(
  api: Pick<TebexApi, 'getBasket' | 'getBasketAuthMethods'>,
  request: { currentIdent: string | null; returnUrl: string },
): Promise<CheckoutResult> {
  if (!request.currentIdent) return { kind: 'empty', basket: null }

  // Always re-read the basket so the checkout link and contents are current.
  const { basket } = await loadBasket(api, request.currentIdent)
  if (!basket || basket.packages.length === 0) return { kind: 'empty', basket }

  if (!isBasketAuthorized(basket)) {
    const methods = await api.getBasketAuthMethods(basket.ident, request.returnUrl)
    if (methods.length > 0) return { kind: 'login-required', basket, methods }
  }

  const url = getCheckoutUrl(basket)
  if (!url) {
    throw new TebexError('invalid-response', 'Tebex did not provide a checkout link for this basket. Please try again.')
  }
  return { kind: 'redirect', basket, url }
}
