import { describe, expect, it, vi } from 'vitest'
import { addToBasketFlow, basketItemCount, checkoutFlow, ensureBasket, loadBasket } from './basket-flow'
import type { TebexApi } from './tebex/api'
import { TebexError } from './tebex/client'
import { makeBasket } from './test-fixtures'

const urls = { completeUrl: 'https://site.test/checkout/complete', cancelUrl: 'https://site.test/basket' }
const product = { ident: 'pkg_10_1', id: 1 }
const returnUrl = 'https://site.test/scripts/x?tebex_auth=1'

type MockApi = { [K in 'getBasket' | 'createBasket' | 'getBasketAuthMethods' | 'addPackage']: ReturnType<typeof vi.fn> }

function mockApi(overrides: Partial<MockApi> = {}) {
  const api: MockApi = {
    getBasket: vi.fn(),
    createBasket: vi.fn(() => Promise.resolve(makeBasket({ ident: 'new-basket' }))),
    getBasketAuthMethods: vi.fn(() => Promise.resolve([{ name: 'FiveM', url: 'https://ident.tebex.io/login' }])),
    addPackage: vi.fn(),
    ...overrides,
  }
  return api as MockApi & Pick<TebexApi, keyof MockApi>
}

const authorized = (extra = {}) => makeBasket({ ident: 'b-1', username: 'Mike', username_id: '1', ...extra })

describe('loadBasket', () => {
  it('treats 404 as an expired basket', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.reject(new TebexError('http', 'Basket not found', 404))) })
    await expect(loadBasket(api, 'old')).resolves.toEqual({ basket: null, completed: null })
  })

  it('separates paid baskets', async () => {
    const paid = makeBasket({ complete: true })
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(paid)) })
    await expect(loadBasket(api, 'b')).resolves.toEqual({ basket: null, completed: paid })
  })

  it('rethrows network errors so the basket is not discarded', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.reject(new TebexError('network', 'offline'))) })
    await expect(loadBasket(api, 'b')).rejects.toMatchObject({ kind: 'network' })
  })
})

describe('ensureBasket', () => {
  it('reuses a live basket and replaces an expired one', async () => {
    const live = makeBasket({ ident: 'live' })
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(live)) })
    await expect(ensureBasket(api, 'live', urls)).resolves.toBe(live)
    expect(api.createBasket).not.toHaveBeenCalled()

    api.getBasket.mockImplementation(() => Promise.reject(new TebexError('http', 'Basket not found', 404)))
    await expect(ensureBasket(api, 'live', urls)).resolves.toMatchObject({ ident: 'new-basket' })
    expect(api.createBasket).toHaveBeenCalledWith(urls)
  })
})

describe('addToBasketFlow', () => {
  it('asks the customer to log in before adding (Tebex rejects unauthenticated adds)', async () => {
    const api = mockApi()
    const result = await addToBasketFlow(api, { currentIdent: null, product, urls, returnUrl })
    expect(result.kind).toBe('login-required')
    expect(api.getBasketAuthMethods).toHaveBeenCalledWith('new-basket', returnUrl)
    expect(api.addPackage).not.toHaveBeenCalled()
  })

  it('adds by ident once authorised', async () => {
    const updated = authorized({ packages: [{ id: 1, name: 'MS8000', in_basket: { quantity: 1, price: 10 } }] })
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(authorized())), addPackage: vi.fn(() => Promise.resolve(updated)) })
    const result = await addToBasketFlow(api, { currentIdent: 'b-1', product, urls, returnUrl })
    expect(result).toEqual({ kind: 'added', basket: updated })
    expect(api.addPackage).toHaveBeenCalledWith('b-1', 'pkg_10_1', 1)
  })

  it('does not add the same script twice', async () => {
    const existing = authorized({ packages: [{ id: 1, name: 'MS8000', in_basket: { quantity: 1, price: 10 } }] })
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(existing)) })
    const result = await addToBasketFlow(api, { currentIdent: 'b-1', product, urls, returnUrl })
    expect(result.kind).toBe('already-in-basket')
    expect(api.addPackage).not.toHaveBeenCalled()
  })

  it('explains the problem when Tebex demands login but offers no method', async () => {
    const api = mockApi({
      getBasketAuthMethods: vi.fn(() => Promise.resolve([])),
      addPackage: vi.fn(() => Promise.reject(new TebexError('http', 'User must login before adding packages to basket', 422))),
    })
    await expect(addToBasketFlow(api, { currentIdent: null, product, urls, returnUrl })).rejects.toMatchObject({
      status: 422,
      message: expect.stringContaining('no login option'),
    })
  })
})

describe('checkoutFlow', () => {
  const withItem = (extra = {}) => authorized({ packages: [{ id: 1, name: 'MS8000', in_basket: { quantity: 1, price: 10 } }], ...extra })

  it('returns the genuine Tebex checkout URL', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(withItem({ links: { checkout: 'https://pay.tebex.io/b-1' } }))) })
    await expect(checkoutFlow(api, { currentIdent: 'b-1', returnUrl })).resolves.toMatchObject({ kind: 'redirect', url: 'https://pay.tebex.io/b-1' })
  })

  it('refuses to redirect anywhere other than tebex.io', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(withItem({ links: { checkout: 'https://evil.test/pay' } }))) })
    await expect(checkoutFlow(api, { currentIdent: 'b-1', returnUrl })).rejects.toMatchObject({ kind: 'invalid-response' })
  })

  it('reports an empty or missing basket', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(authorized())) })
    await expect(checkoutFlow(api, { currentIdent: 'b-1', returnUrl })).resolves.toMatchObject({ kind: 'empty' })
    await expect(checkoutFlow(api, { currentIdent: null, returnUrl })).resolves.toEqual({ kind: 'empty', basket: null })
  })

  it('requires login for an unauthorised basket', async () => {
    const api = mockApi({ getBasket: vi.fn(() => Promise.resolve(withItem({ username: null, username_id: null }))) })
    await expect(checkoutFlow(api, { currentIdent: 'b-1', returnUrl })).resolves.toMatchObject({ kind: 'login-required' })
  })
})

describe('basketItemCount', () => {
  it('sums quantities', () => {
    expect(basketItemCount(null)).toBe(0)
    expect(
      basketItemCount(
        makeBasket({
          packages: [
            { id: 1, name: 'A', in_basket: { quantity: 1, price: 1 } },
            { id: 2, name: 'B', in_basket: { quantity: 2, price: 1 } },
          ],
        }),
      ),
    ).toBe(3)
  })
})
