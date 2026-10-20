import { describe, expect, it, vi } from 'vitest'
import { TebexError } from './client'
import { isTransientError, withRetry } from './retry'

describe('withRetry', () => {
  it('retries network failures, rate limits and server errors, then succeeds', async () => {
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new TebexError('network', 'offline'))
      .mockRejectedValueOnce(new TebexError('http', 'Too many requests', 429))
      .mockResolvedValueOnce('ok')
    await expect(withRetry(task, { delays: [1, 1] })).resolves.toBe('ok')
    expect(task).toHaveBeenCalledTimes(3)
  })

  it('gives up after the last delay', async () => {
    const task = vi.fn<() => Promise<string>>().mockRejectedValue(new TebexError('http', 'Bad gateway', 502))
    await expect(withRetry(task, { delays: [1, 1] })).rejects.toMatchObject({ status: 502 })
    expect(task).toHaveBeenCalledTimes(3)
  })

  it('does not retry answers that will not change (4xx)', async () => {
    const task = vi.fn<() => Promise<string>>().mockRejectedValue(new TebexError('http', 'Account not found', 404))
    await expect(withRetry(task, { delays: [1, 1] })).rejects.toMatchObject({ status: 404 })
    expect(task).toHaveBeenCalledTimes(1)
  })

  it('classifies errors', () => {
    expect(isTransientError(new TebexError('timeout', 'slow'))).toBe(true)
    expect(isTransientError(new TebexError('http', 'x', 503))).toBe(true)
    expect(isTransientError(new TebexError('http', 'x', 422))).toBe(false)
    expect(isTransientError(new Error('other'))).toBe(false)
  })
})
