import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeBasket } from '../test-fixtures'
import { createTebexApi, getCheckoutUrl, isBasketAuthorized, isTebexUrl, parseAuthMethods } from './api'

afterEach(() => vi.unstubAllGlobals())

function captureFetch(body: unknown = { data: makeBasket() }) {
  const calls: { url: string; init: RequestInit }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init: RequestInit) => {
      calls.push({ url, init })
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    }),
  )
  return calls
}

describe('createTebexApi endpoints', () => {
  const api = createTebexApi('abcd-0123456789abcdef0123')

  it('scopes store endpoints to the public token', async () => {
    const calls = captureFetch({ data: [] })
    await api.getCategoriesWithPackages()
    await api.getWebstore()
    expect(calls.map((call) => call.url)).toEqual([
      'https://headless.tebex.io/api/accounts/abcd-0123456789abcdef0123/categories?includePackages=1',
      'https://headless.tebex.io/api/accounts/abcd-0123456789abcdef0123',
    ])
  })

  it('creates a basket with complete and cancel URLs', async () => {
    const calls = captureFetch()
    await api.createBasket({ completeUrl: 'https://site.test/checkout/complete', cancelUrl: 'https://site.test/basket' })
    expect(calls[0]?.url).toBe('https://headless.tebex.io/api/accounts/abcd-0123456789abcdef0123/baskets')
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      complete_url: 'https://site.test/checkout/complete',
      cancel_url: 'https://site.test/basket',
      complete_auto_redirect: true,
    })
  })

  it('adds and removes packages through the basket-only API using the ident', async () => {
    const calls = captureFetch()
    await api.addPackage('dw15-abc', 'pkg_12_456')
    await api.removePackage('dw15-abc', 'pkg_12_456')
    expect(calls[0]?.url).toBe('https://headless.tebex.io/api/baskets/dw15-abc/packages')
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({ package_id: 'pkg_12_456', quantity: 1 })
    expect(calls[1]?.url).toBe('https://headless.tebex.io/api/baskets/dw15-abc/packages/remove')
    expect(JSON.parse(String(calls[1]?.init.body))).toEqual({ package_id: 'pkg_12_456' })
  })

  it('URL-encodes the auth return URL', async () => {
    const calls = captureFetch([{ name: 'FiveM', url: 'https://ident.tebex.io/x' }])
    const methods = await api.getBasketAuthMethods('b-1', 'https://site.test/scripts/ms8000?tebex_auth=1')
    expect(calls[0]?.url).toBe(
      'https://headless.tebex.io/api/accounts/abcd-0123456789abcdef0123/baskets/b-1/auth?returnUrl=https%3A%2F%2Fsite.test%2Fscripts%2Fms8000%3Ftebex_auth%3D1',
    )
    expect(methods).toEqual([{ name: 'FiveM', url: 'https://ident.tebex.io/x' }])
  })
})

describe('parseAuthMethods', () => {
  it('handles the shapes Tebex has been seen returning', () => {
    expect(parseAuthMethods([[]])).toEqual([])
    expect(parseAuthMethods({ data: [{ name: 'FiveM', url: 'https://a.test' }] })).toEqual([{ name: 'FiveM', url: 'https://a.test' }])
    expect(parseAuthMethods([[{ name: 'Steam', url: 'https://b.test' }]])).toEqual([{ name: 'Steam', url: 'https://b.test' }])
    expect(parseAuthMethods(null)).toEqual([])
  })

  it('ignores non-HTTPS login URLs', () => {
    expect(parseAuthMethods([{ name: 'Bad', url: 'javascript:alert(1)' }, { name: 'Http', url: 'http://x.test' }])).toEqual([])
  })
})

describe('checkout URL handling', () => {
  it('accepts only genuine Tebex HTTPS URLs', () => {
    expect(isTebexUrl('https://pay.tebex.io/dw15q0-009c3c')).toBe(true)
    expect(isTebexUrl('https://tebex.io/checkout')).toBe(true)
    expect(isTebexUrl('http://pay.tebex.io/x')).toBe(false)
    expect(isTebexUrl('https://pay.tebex.io.evil.test/x')).toBe(false)
    expect(isTebexUrl('https://eviltebex.io/x')).toBe(false)
    expect(isTebexUrl('not a url')).toBe(false)
  })

  it('reads links.checkout and tolerates the empty-array form', () => {
    expect(getCheckoutUrl(makeBasket({ links: { checkout: 'https://pay.tebex.io/abc' } }))).toBe('https://pay.tebex.io/abc')
    expect(getCheckoutUrl(makeBasket({ links: [] }))).toBeNull()
    expect(getCheckoutUrl(makeBasket({ links: { checkout: 'https://phishing.test/pay' } }))).toBeNull()
  })

  it('treats a basket with a username as authorised', () => {
    expect(isBasketAuthorized(null)).toBe(false)
    expect(isBasketAuthorized(makeBasket())).toBe(false)
    expect(isBasketAuthorized(makeBasket({ username: 'Mike', username_id: '069a79f4' }))).toBe(true)
  })
})
