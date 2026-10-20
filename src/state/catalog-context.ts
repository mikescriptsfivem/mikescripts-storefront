import { createContext, useContext } from 'react'
import type { Catalog } from '../lib/catalog'
import type { TebexError } from '../lib/tebex/client'
import type { TebexCmsPage, TebexWebstore } from '../lib/tebex/types'

export type CatalogStatus = 'unconfigured' | 'loading' | 'ready' | 'error'

export interface CatalogContextValue {
  status: CatalogStatus
  catalog: Catalog | null
  webstore: TebexWebstore | null
  /** Custom pages created in the Tebex panel (visible ones only). */
  pages: TebexCmsPage[]
  error: TebexError | null
  retry: () => void
}

export const CatalogContext = createContext<CatalogContextValue | null>(null)

export function useCatalog(): CatalogContextValue {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return value
}
