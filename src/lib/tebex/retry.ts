import { isTebexError } from './client'

/** Network failures, timeouts, rate limits (429) and server errors (5xx) are worth retrying; 4xx answers are not. */
export function isTransientError(error: unknown): boolean {
  if (!isTebexError(error)) return false
  return error.kind === 'network' || error.kind === 'timeout' || error.status === 429 || error.status >= 500
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    })
  })

/**
 * Runs a read-only request, retrying transient failures with increasing pauses.
 * Never use this for basket changes: retrying a POST could apply it twice.
 */
export async function withRetry<T>(task: () => Promise<T>, { delays = [1000, 2500], signal }: { delays?: number[]; signal?: AbortSignal } = {}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task()
    } catch (error) {
      const delay = delays[attempt]
      if (delay === undefined || !isTransientError(error) || signal?.aborted) throw error
      await sleep(delay, signal)
    }
  }
}
