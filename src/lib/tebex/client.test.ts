import { afterEach, describe, expect, it, vi } from 'vitest'
import { TebexError, tebexRequest } from './client'

function mockFetch(response: Response | Error) {
  const fn = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)))
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('tebexRequest', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }))
    await expect(tebexRequest('https://headless.tebex.io/api/x')).resolves.toEqual({ data: { ok: true } })
  })

  it('sends no Content-Type on GET (no CORS preflight) and JSON on POST', async () => {
    const fetchMock = mockFetch(new Response('{"data":{}}', { status: 200 }))
    await tebexRequest('https://headless.tebex.io/api/x')
    expect(fetchMock.mock.calls[0]).toBeDefined()
    const getInit = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect(getInit.headers).toEqual({ Accept: 'application/json' })

    fetchMock.mockImplementation(() => Promise.resolve(new Response('{"data":{}}', { status: 200 })))
    await tebexRequest('https://headless.tebex.io/api/x', { method: 'POST', body: { a: 1 } })
    const postInit = (fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1]
    expect(postInit.method).toBe('POST')
    expect(postInit.body).toBe('{"a":1}')
    expect(postInit.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  it('uses the RFC 9457 problem detail as the error message', async () => {
    const problem = { status: 422, type: 'about:blank', title: 'Request payload error', detail: 'User must login before adding packages to basket' }
    mockFetch(new Response(JSON.stringify(problem), { status: 422 }))
    const error = await tebexRequest('https://headless.tebex.io/api/x').catch((reason: unknown) => reason)
    expect(error).toBeInstanceOf(TebexError)
    expect(error).toMatchObject({ kind: 'http', status: 422, message: 'User must login before adding packages to basket' })
  })

  it('falls back to the title, then a generic message', async () => {
    mockFetch(new Response(JSON.stringify({ title: 'Invalid account identifier provided' }), { status: 404 }))
    await expect(tebexRequest('https://x')).rejects.toMatchObject({ status: 404, message: 'Invalid account identifier provided' })

    mockFetch(new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(tebexRequest('https://x')).rejects.toMatchObject({ status: 502, message: expect.stringContaining('Tebex is having trouble') })
  })

  it('reports network failures without leaking internals', async () => {
    mockFetch(new TypeError('Failed to fetch'))
    await expect(tebexRequest('https://x')).rejects.toMatchObject({ kind: 'network', message: expect.stringContaining('Could not reach Tebex') })
  })

  it('times out slow requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          }),
      ),
    )
    await expect(tebexRequest('https://x', { timeoutMs: 20 })).rejects.toMatchObject({ kind: 'timeout' })
  })

  it('rejects non-JSON success responses', async () => {
    mockFetch(new Response('not json', { status: 200 }))
    await expect(tebexRequest('https://x')).rejects.toMatchObject({ kind: 'invalid-response' })
  })
})
