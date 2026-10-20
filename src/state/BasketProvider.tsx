import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { authReturnUrl, isAuthReturn } from '../lib/auth-return'
import {
  addToBasketFlow,
  basketHasPackage,
  basketItemCount,
  checkoutFlow,
  ensureBasket,
  isMissingBasketError,
  loadBasket,
} from '../lib/basket-flow'
import type { Product } from '../lib/catalog'
import { readJson, removeKey, writeJson } from '../lib/storage'
import { isBasketAuthorized } from '../lib/tebex/api'
import { isTebexError } from '../lib/tebex/client'
import { tebexApi } from '../lib/tebex/instance'
import type { TebexAuthMethod, TebexBasket } from '../lib/tebex/types'
import { appUrl } from '../lib/url'
import { BasketContext, type BasketContextValue, type BasketMessage, type BasketPhase, type PurchaseIntent } from './basket-context'
import { useCatalog } from './catalog-context'

const BASKET_KEY = 'mikescripts.basket'
const PENDING_KEY = 'mikescripts.pendingAdd'
/** A purchase started before logging in is only resumed if the customer returns within this window. */
const PENDING_TTL_MS = 30 * 60 * 1000

interface PendingAdd {
  ident: string
  id: number
  name: string
  intent: PurchaseIntent
  basketIdent: string
  createdAt: number
}

function errorText(error: unknown): string {
  return isTebexError(error) ? error.message : 'Something went wrong. Please try again.'
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const api = tebexApi
  const { catalog } = useCatalog()

  const [basket, setBasket] = useState<TebexBasket | null>(null)
  const [completedBasket, setCompletedBasket] = useState<TebexBasket | null>(null)
  const [phase, setPhase] = useState<BasketPhase>(api ? 'restoring' : 'idle')
  const [pendingIdent, setPendingIdent] = useState<string | null>(null)
  const [message, setMessage] = useState<BasketMessage | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [authChoices, setAuthChoices] = useState<TebexAuthMethod[] | null>(null)

  // Refs guard against double submissions between renders.
  const busyRef = useRef(false)
  const redirectingRef = useRef(false)
  const catalogRef = useRef(catalog)
  useEffect(() => {
    catalogRef.current = catalog
  }, [catalog])

  const urls = useMemo(() => ({ completeUrl: appUrl('/checkout/complete'), cancelUrl: appUrl('/basket') }), [])

  const saveBasket = useCallback((next: TebexBasket | null) => {
    setBasket(next)
    if (next) writeJson(BASKET_KEY, next.ident)
    else removeKey(BASKET_KEY)
  }, [])

  const redirectTo = useCallback((url: string) => {
    redirectingRef.current = true
    setPhase('redirecting')
    window.location.assign(url)
  }, [])

  const startLogin = useCallback(
    (methods: TebexAuthMethod[]) => {
      const [only] = methods
      if (methods.length === 1 && only) redirectTo(only.url)
      else setAuthChoices(methods)
    },
    [redirectTo],
  )

  /** Runs one basket operation at a time; extra clicks while busy are ignored. */
  const exclusive = useCallback(
    async (task: () => Promise<void>) => {
      if (!api || busyRef.current || redirectingRef.current) return
      busyRef.current = true
      setPhase('working')
      try {
        await task()
      } catch (error) {
        setMessage({ tone: 'error', text: errorText(error) })
      } finally {
        busyRef.current = false
        if (!redirectingRef.current) setPhase('idle')
      }
    },
    [api],
  )

  const goToCheckout = useCallback(async () => {
    if (!api) return
    const result = await checkoutFlow(api, {
      currentIdent: readJson<string>(BASKET_KEY),
      returnUrl: authReturnUrl('/basket'),
    })
    saveBasket(result.basket)
    if (result.kind === 'empty') {
      setMessage({ tone: 'info', text: 'Your basket is empty.' })
    } else if (result.kind === 'login-required') {
      startLogin(result.methods)
    } else {
      redirectTo(result.url)
    }
  }, [api, saveBasket, startLogin, redirectTo])

  const performAdd = useCallback(
    async (product: { ident: string; id: number; name: string }, intent: PurchaseIntent) => {
      if (!api) return
      const result = await addToBasketFlow(api, {
        currentIdent: readJson<string>(BASKET_KEY),
        product,
        urls,
        returnUrl: authReturnUrl(),
      })
      saveBasket(result.basket)

      if (result.kind === 'login-required') {
        const pending: PendingAdd = { ...product, intent, basketIdent: result.basket.ident, createdAt: Date.now() }
        writeJson(PENDING_KEY, pending)
        startLogin(result.methods)
        return
      }
      setMessage(
        result.kind === 'added'
          ? { tone: 'success', text: `${product.name} was added to your basket.` }
          : { tone: 'info', text: `${product.name} is already in your basket.` },
      )
      if (intent === 'checkout') await goToCheckout()
      else setDrawerOpen(true)
    },
    [api, urls, saveBasket, startLogin, goToCheckout],
  )

  // Restore the saved basket, and resume a purchase if the customer just returned from logging in.
  useEffect(() => {
    if (!api) return
    let cancelled = false
    const returnedFromLogin = isAuthReturn()
    const ident = readJson<string>(BASKET_KEY)

    void (async () => {
      let restored: TebexBasket | null = null
      try {
        if (ident) {
          const loaded = await loadBasket(api, ident)
          if (cancelled) return
          if (loaded.completed) setCompletedBasket(loaded.completed)
          if (!loaded.basket) removeKey(BASKET_KEY)
          restored = loaded.basket
        }
      } catch (error) {
        if (cancelled) return
        setMessage({ tone: 'error', text: `Your basket could not be loaded. ${errorText(error)}` })
      }
      if (cancelled) return
      setBasket(restored)
      setPhase('idle')

      if (!returnedFromLogin) return
      const pending = readJson<PendingAdd>(PENDING_KEY)
      removeKey(PENDING_KEY)
      if (!restored || !isBasketAuthorized(restored)) {
        if (pending) setMessage({ tone: 'error', text: 'Login was not completed, so nothing was added. Please try again.' })
        return
      }
      if (pending && pending.basketIdent === restored.ident && Date.now() - pending.createdAt < PENDING_TTL_MS) {
        await exclusive(async () => {
          setPendingIdent(pending.ident)
          try {
            await performAdd(pending, pending.intent)
          } finally {
            setPendingIdent(null)
          }
        })
      } else {
        setMessage({ tone: 'success', text: `Logged in as ${restored.username ?? 'your Tebex account'}.` })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [api, exclusive, performAdd])

  // Coming back with the browser's Back button can restore a page that was mid-redirect.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      redirectingRef.current = false
      busyRef.current = false
      setAuthChoices(null)
      setPhase('idle')
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const addToBasket = useCallback(
    (product: Product, intent: PurchaseIntent = 'basket') =>
      exclusive(async () => {
        setPendingIdent(product.ident)
        try {
          await performAdd({ ident: product.ident, id: product.id, name: product.title }, intent)
        } finally {
          setPendingIdent(null)
        }
      }),
    [exclusive, performAdd],
  )

  const removeFromBasket = useCallback(
    (productId: number) =>
      exclusive(async () => {
        const ident = readJson<string>(BASKET_KEY)
        if (!api || !ident) return
        const packageId = catalogRef.current?.byId.get(productId)?.ident ?? String(productId)
        try {
          saveBasket(await api.removePackage(ident, packageId))
        } catch (error) {
          if (!isMissingBasketError(error)) throw error
          saveBasket(null)
          setMessage({ tone: 'info', text: 'Your basket had expired, so it was cleared.' })
        }
      }),
    [api, exclusive, saveBasket],
  )

  const login = useCallback(
    () =>
      exclusive(async () => {
        if (!api) return
        const current = await ensureBasket(api, readJson<string>(BASKET_KEY), urls)
        saveBasket(current)
        if (isBasketAuthorized(current)) {
          setMessage({ tone: 'info', text: `You are logged in as ${current.username ?? 'your Tebex account'}.` })
          return
        }
        const methods = await api.getBasketAuthMethods(current.ident, authReturnUrl())
        if (methods.length === 0) {
          setMessage({ tone: 'info', text: 'Tebex did not offer a login option right now. Please try again shortly.' })
          return
        }
        removeKey(PENDING_KEY)
        startLogin(methods)
      }),
    [api, exclusive, urls, saveBasket, startLogin],
  )

  const logout = useCallback(() => {
    if (busyRef.current || redirectingRef.current) return
    saveBasket(null)
    removeKey(PENDING_KEY)
    setDrawerOpen(false)
    setMessage({ tone: 'info', text: 'Logged out. Your basket on this device was cleared.' })
  }, [saveBasket])

  const checkout = useCallback(() => exclusive(goToCheckout), [exclusive, goToCheckout])

  const chooseAuthMethod = useCallback(
    (method: TebexAuthMethod) => {
      setAuthChoices(null)
      redirectTo(method.url)
    },
    [redirectTo],
  )

  const cancelAuthChoice = useCallback(() => {
    setAuthChoices(null)
    removeKey(PENDING_KEY)
  }, [])

  const value = useMemo<BasketContextValue>(
    () => ({
      enabled: Boolean(api),
      basket,
      completedBasket,
      itemCount: basketItemCount(basket),
      isAuthorized: isBasketAuthorized(basket),
      username: basket?.username ?? null,
      phase,
      isBusy: phase !== 'idle',
      pendingIdent,
      message,
      dismissMessage: () => setMessage(null),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      authChoices,
      chooseAuthMethod,
      cancelAuthChoice,
      isInBasket: (productId: number) => basketHasPackage(basket, productId),
      addToBasket,
      removeFromBasket,
      login,
      logout,
      checkout,
    }),
    [
      api,
      basket,
      completedBasket,
      phase,
      pendingIdent,
      message,
      drawerOpen,
      authChoices,
      chooseAuthMethod,
      cancelAuthChoice,
      addToBasket,
      removeFromBasket,
      login,
      logout,
      checkout,
    ],
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}
