import { createContext, useContext } from 'react'
import type { Product } from '../lib/catalog'
import type { TebexAuthMethod, TebexBasket } from '../lib/tebex/types'

export type BasketPhase = 'restoring' | 'idle' | 'working' | 'redirecting'
export type PurchaseIntent = 'basket' | 'checkout'

export interface BasketMessage {
  tone: 'success' | 'info' | 'error'
  text: string
}

export interface BasketContextValue {
  /** False when no Tebex public token is configured. */
  enabled: boolean
  basket: TebexBasket | null
  /** A basket that Tebex reports as paid (shown on the order complete page). */
  completedBasket: TebexBasket | null
  itemCount: number
  isAuthorized: boolean
  username: string | null
  phase: BasketPhase
  /** True while a basket operation runs or the page is redirecting to Tebex. */
  isBusy: boolean
  /** Product ident currently being added. */
  pendingIdent: string | null
  message: BasketMessage | null
  dismissMessage: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  /** Login options to choose from when Tebex offers more than one. */
  authChoices: TebexAuthMethod[] | null
  chooseAuthMethod: (method: TebexAuthMethod) => void
  cancelAuthChoice: () => void
  isInBasket: (productId: number) => boolean
  addToBasket: (product: Product, intent?: PurchaseIntent) => Promise<void>
  removeFromBasket: (productId: number) => Promise<void>
  login: () => Promise<void>
  logout: () => void
  checkout: () => Promise<void>
}

export const BasketContext = createContext<BasketContextValue | null>(null)

export function useBasket(): BasketContextValue {
  const value = useContext(BasketContext)
  if (!value) throw new Error('useBasket must be used inside <BasketProvider>')
  return value
}
