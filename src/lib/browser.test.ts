import { describe, expect, it } from 'vitest'
import { detectBrowser, unblockGuide } from './browser'

const UA = {
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  opera: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/120.0.0.0',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
}

describe('detectBrowser', () => {
  it('recognises the common browsers', () => {
    expect(detectBrowser(UA.edge, false)).toBe('edge')
    expect(detectBrowser(UA.chrome, false)).toBe('chrome')
    expect(detectBrowser(UA.chrome, true)).toBe('brave')
    expect(detectBrowser(UA.opera, false)).toBe('opera')
    expect(detectBrowser(UA.firefox, false)).toBe('firefox')
    expect(detectBrowser(UA.safari, false)).toBe('safari')
  })
})

describe('unblockGuide', () => {
  it('gives Edge users the tracking prevention fix', () => {
    const guide = unblockGuide('edge')
    expect(guide.cause).toMatch(/tracking prevention/)
    expect(guide.steps.join(' ')).toMatch(/Tracking prevention for this site/)
    expect(guide.alternative).toMatch(/Balanced/)
  })

  it('falls back to general advice', () => {
    expect(unblockGuide('chrome').browser).toBe('your browser')
    expect(unblockGuide('other').steps.length).toBeGreaterThan(1)
  })
})
