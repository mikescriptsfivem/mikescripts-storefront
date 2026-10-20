import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { site } from '../../config/site'
import { readJson, writeJson } from '../../lib/storage'
import { recentCustomersFromSidebar } from '../../lib/tebex/api'
import { tebexApi } from '../../lib/tebex/instance'
import type { RecentCustomer } from '../../lib/tebex/types'
import { useCatalog } from '../../state/catalog-context'
import { CloseIcon } from '../ui/icons'

/** Per-browser-session state: "shown" after a full round, "dismissed" when closed. */
const SESSION_KEY = 'mikescripts.recentCustomers'

function Avatar({ customer }: { customer: RecentCustomer }) {
  const [failed, setFailed] = useState(false)
  if (!customer.avatarUrl || failed) {
    return (
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600/20 font-semibold text-accent-300">
        {customer.username.charAt(0).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={customer.avatarUrl}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full border border-ink-600 object-cover"
    />
  )
}

/**
 * Small corner pop-up showing genuine recent buyers from Tebex, a few times per visit.
 * Only the name and avatar Tebex shares publicly are shown: no product, no time, nothing invented.
 */
export function RecentCustomers() {
  const config = site.recentCustomers
  const { status, snapshotAt } = useCatalog()
  const { pathname } = useLocation()
  const [customers, setCustomers] = useState<RecentCustomer[]>([])
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!config.enabled || !tebexApi || status !== 'ready' || snapshotAt || readJson<string>(SESSION_KEY, 'session')) return
    const controller = new AbortController()
    tebexApi
      .getSidebar(controller.signal)
      .then((modules) => setCustomers(recentCustomersFromSidebar(modules).slice(0, config.max)))
      .catch(() => undefined)
    return () => controller.abort()
  }, [config.enabled, config.max, status, snapshotAt])

  useEffect(() => {
    if (customers.length === 0) return
    const timers: number[] = []
    let next = 0
    const show = () => {
      if (next >= customers.length) {
        writeJson(SESSION_KEY, 'shown', 'session')
        return
      }
      setIndex(next)
      next++
      timers.push(window.setTimeout(() => setIndex(null), config.visibleSeconds * 1000))
      timers.push(window.setTimeout(show, config.intervalSeconds * 1000))
    }
    timers.push(window.setTimeout(show, config.firstDelaySeconds * 1000))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [customers, config.firstDelaySeconds, config.visibleSeconds, config.intervalSeconds])

  const dismiss = () => {
    writeJson(SESSION_KEY, 'dismissed', 'session')
    setIndex(null)
    setCustomers([])
  }

  const customer = index === null ? undefined : customers[index]
  if (!customer || pathname.startsWith('/checkout')) return null

  return (
    <aside
      aria-label="Recent customer"
      className="fixed bottom-4 left-4 z-[85] hidden w-72 animate-fade-up items-center gap-3 rounded-lg border border-ink-600 bg-ink-850/95 p-3 pr-2 shadow-2xl shadow-black backdrop-blur sm:flex"
    >
      <Avatar key={customer.username} customer={customer} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{customer.username}</p>
        <p className="text-xs text-mist-400">Recent MikeScripts customer</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="self-start rounded p-1 text-mist-500 transition-colors hover:bg-white/5 hover:text-white"
        aria-label="Hide recent customers"
      >
        <CloseIcon size={14} />
      </button>
    </aside>
  )
}
