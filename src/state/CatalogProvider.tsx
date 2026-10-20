import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { productContent } from '../config/products'
import { site } from '../config/site'
import { buildCatalog } from '../lib/catalog'
import { readJson, writeJson } from '../lib/storage'
import { TebexError } from '../lib/tebex/client'
import { tebexApi } from '../lib/tebex/instance'
import { withRetry } from '../lib/tebex/retry'
import type { TebexCategory, TebexCmsPage, TebexWebstore } from '../lib/tebex/types'
import { publicAsset } from '../lib/url'
import { CatalogContext, type CatalogContextValue } from './catalog-context'

interface RawCatalog {
  categories: TebexCategory[]
  webstore: TebexWebstore | null
  pages: TebexCmsPage[]
}

interface CachedCatalog extends RawCatalog {
  savedAt: number
}

/** Short session cache so moving between pages does not refetch. Prices are never stored long-term. */
const CACHE_KEY = 'mikescripts.catalog.v1'
const CACHE_TTL_MS = 5 * 60 * 1000

function readCache(): RawCatalog | null {
  const cached = readJson<CachedCatalog>(CACHE_KEY, 'session')
  if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS || !Array.isArray(cached.categories)) return null
  return cached
}

async function fetchCatalog(signal: AbortSignal): Promise<RawCatalog> {
  if (!tebexApi) throw new TebexError('invalid-response', 'The store is not connected.')
  const api = tebexApi
  const [categories, webstore, pages] = await Promise.all([
    // Brief outages and rate limits are retried before falling back.
    withRetry(() => api.getCategoriesWithPackages(signal), { signal }),
    api.getWebstore(signal).catch(() => null),
    api.getPages(signal).catch(() => [] as TebexCmsPage[]),
  ])
  return { categories, webstore, pages: Array.isArray(pages) ? pages : [] }
}

/**
 * The catalogue saved on this site at build time (scripts/prerender-routes.mjs). Used only when the visitor's
 * browser cannot reach Tebex (VPNs, strict tracking prevention, security software).
 */
async function fetchSnapshot(signal: AbortSignal): Promise<{ generatedAt: string; categories: TebexCategory[] } | null> {
  try {
    const response = await fetch(publicAsset('catalog-snapshot.json'), { signal, cache: 'no-cache' })
    if (!response.ok) return null
    const data = (await response.json()) as { generatedAt?: unknown; categories?: unknown }
    return typeof data.generatedAt === 'string' && Array.isArray(data.categories)
      ? { generatedAt: data.generatedAt, categories: data.categories as TebexCategory[] }
      : null
  } catch {
    return null
  }
}

function toTebexError(reason: unknown): TebexError {
  return reason instanceof TebexError ? reason : new TebexError('invalid-response', 'The catalogue could not be loaded. Please try again.')
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<RawCatalog | null>(() => (tebexApi ? readCache() : null))
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null)
  const [error, setError] = useState<TebexError | null>(null)
  const [attempt, setAttempt] = useState(0)
  const refreshing = useRef(false)

  const applyLive = useCallback((data: RawCatalog) => {
    writeJson(CACHE_KEY, { ...data, savedAt: Date.now() } satisfies CachedCatalog, 'session')
    setRaw(data)
    setSnapshotAt(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!tebexApi || raw) return
    const controller = new AbortController()
    fetchCatalog(controller.signal)
      .then(applyLive)
      .catch(async (reason: unknown) => {
        if (controller.signal.aborted) return
        const snapshot = await fetchSnapshot(controller.signal)
        if (controller.signal.aborted) return
        if (snapshot) {
          setRaw({ categories: snapshot.categories, webstore: null, pages: [] })
          setSnapshotAt(snapshot.generatedAt)
        } else {
          setError(toTebexError(reason))
        }
      })
    return () => controller.abort()
  }, [raw, attempt, applyLive])

  /** Try the live catalogue again without clearing what is on screen. */
  const refreshLive = useCallback(() => {
    if (refreshing.current) return
    refreshing.current = true
    fetchCatalog(new AbortController().signal)
      .then(applyLive)
      .catch(() => undefined)
      .finally(() => {
        refreshing.current = false
      })
  }, [applyLive])

  const retry = useCallback(() => {
    if (snapshotAt) {
      refreshLive()
      return
    }
    setError(null)
    setAttempt((value) => value + 1)
  }, [snapshotAt, refreshLive])

  // After a failure (or while showing the saved catalogue), try again when the connection returns or the visitor
  // comes back to the tab.
  useEffect(() => {
    if (!error && !snapshotAt) return
    const onOnline = () => retry()
    const onVisible = () => document.visibilityState === 'visible' && retry()
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [error, snapshotAt, retry])

  const value = useMemo<CatalogContextValue>(() => {
    if (!tebexApi) {
      return { status: 'unconfigured', catalog: null, webstore: null, pages: [], error: null, snapshotAt: null, retry }
    }
    if (raw) {
      return {
        status: 'ready',
        catalog: buildCatalog(raw.categories, productContent, site.categories),
        webstore: raw.webstore,
        pages: raw.pages.filter((page) => !page.hidden && !page.disabled && !page.private && page.slug),
        error: null,
        snapshotAt,
        retry,
      }
    }
    return { status: error ? 'error' : 'loading', catalog: null, webstore: null, pages: [], error, snapshotAt: null, retry }
  }, [raw, error, snapshotAt, retry])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
