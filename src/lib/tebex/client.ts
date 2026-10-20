import type { TebexProblem } from './types'

export type TebexErrorKind = 'network' | 'timeout' | 'http' | 'invalid-response'

/** A failed Tebex request, with a message that is safe to show to customers. */
export class TebexError extends Error {
  readonly kind: TebexErrorKind
  readonly status: number

  constructor(kind: TebexErrorKind, message: string, status = 0) {
    super(message)
    this.name = 'TebexError'
    this.kind = kind
    this.status = status
  }
}

export function isTebexError(error: unknown): error is TebexError {
  return error instanceof TebexError
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function problemMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    const problem = payload as TebexProblem
    if (typeof problem.detail === 'string' && problem.detail.trim()) return problem.detail
    if (typeof problem.title === 'string' && problem.title.trim()) return problem.title
  }
  if (status >= 500) return 'Tebex is having trouble right now. Please try again in a moment.'
  return `Tebex rejected the request (HTTP ${status}).`
}

/**
 * Performs a JSON request against the Tebex Headless API.
 * GET requests send no Content-Type header so browsers can skip the CORS preflight.
 */
export async function tebexRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const forwardAbort = () => controller.abort()
  options.signal?.addEventListener('abort', forwardAbort)

  const hasBody = options.body !== undefined
  let response: Response
  let text: string
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: hasBody ? { Accept: 'application/json', 'Content-Type': 'application/json' } : { Accept: 'application/json' },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
    text = await response.text()
  } catch (error) {
    if (options.signal?.aborted) throw error
    if (controller.signal.aborted) {
      throw new TebexError('timeout', 'Tebex took too long to respond. Please try again.')
    }
    throw new TebexError(
      'network',
      'Could not reach Tebex. Check your connection and try again. A VPN, ad blocker or privacy extension blocking headless.tebex.io can also cause this.',
    )
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', forwardAbort)
  }

  let payload: unknown
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = undefined
    }
  }

  if (!response.ok) {
    throw new TebexError('http', problemMessage(payload, response.status), response.status)
  }
  if (payload === undefined || (isRecord(payload) && payload.status === 'error')) {
    throw new TebexError('invalid-response', 'Tebex returned an unexpected response. Please try again.', response.status)
  }
  return payload as T
}
