import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productContent } from '../config/products'
import { site } from '../config/site'
import { buildCatalog } from '../lib/catalog'
import { readJson, writeJson } from '../lib/storage'
import { TebexError } from '../lib/tebex/client'
import { tebexApi } from '../lib/tebex/instance'
import type { TebexCategory, TebexCmsPage, TebexWebstore } from '../lib/tebex/types'
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
  const [categories, webstore, pages] = await Promise.all([
    tebexApi.getCategoriesWithPackages(signal),
    tebexApi.getWebstore(signal).catch(() => null),
    tebexApi.getPages(signal).catch(() => [] as TebexCmsPage[]),
  ])
  return { categories, webstore, pages: Array.isArray(pages) ? pages : [] }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<RawCatalog | null>(() => (tebexApi ? readCache() : null))
  const [error, setError] = useState<TebexError | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!tebexApi || raw) return
    const controller = new AbortController()
    fetchCatalog(controller.signal)
      .then((data) => {
        writeJson(CACHE_KEY, { ...data, savedAt: Date.now() } satisfies CachedCatalog, 'session')
        setRaw(data)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        setError(
          reason instanceof TebexError
            ? reason
            : new TebexError('invalid-response', 'The catalogue could not be loaded. Please try again.'),
        )
      })
    return () => controller.abort()
  }, [raw, attempt])

  const retry = useCallback(() => {
    setError(null)
    setAttempt((value) => value + 1)
  }, [])

  const value = useMemo<CatalogContextValue>(() => {
    if (!tebexApi) {
      return { status: 'unconfigured', catalog: null, webstore: null, pages: [], error: null, retry }
    }
    if (raw) {
      return {
        status: 'ready',
        catalog: buildCatalog(raw.categories, productContent, site.categories),
        webstore: raw.webstore,
        pages: raw.pages.filter((page) => !page.hidden && !page.disabled && !page.private && page.slug),
        error: null,
        retry,
      }
    }
    return { status: error ? 'error' : 'loading', catalog: null, webstore: null, pages: [], error, retry }
  }, [raw, error, retry])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
