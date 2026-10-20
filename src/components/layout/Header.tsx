import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { site } from '../../config/site'
import { useBasket } from '../../state/basket-context'
import { Container } from '../ui/layout'
import { BasketIcon, CloseIcon, DiscordIcon, MenuIcon, Spinner, UserIcon } from '../ui/icons'
import { Brand } from './Brand'
import { ServerBar } from './ServerBar'
import { SnapshotNotice } from './SnapshotNotice'
import { useCatalog } from '../../state/catalog-context'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/scripts', label: 'All Scripts', end: false },
  { to: '/categories', label: 'Categories', end: false },
  { to: '/showcase', label: 'Showcase', end: false },
  { to: '/docs', label: 'Documentation', end: false },
] as const

function AccountButton({ compact = false }: { compact?: boolean }) {
  const basket = useBasket()
  const { snapshotAt } = useCatalog()
  if (!basket.enabled || snapshotAt) return null
  if (basket.isAuthorized) {
    return (
      <button
        type="button"
        onClick={basket.openDrawer}
        className="flex h-10 max-w-[180px] items-center gap-2 rounded-md px-3 text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-white"
        aria-label={`Logged in as ${basket.username ?? 'Tebex customer'}. Open basket`}
      >
        <UserIcon size={18} className="shrink-0 text-accent-400" />
        <span className="truncate">{basket.username}</span>
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => void basket.login()}
      disabled={basket.isBusy}
      className={`flex h-10 items-center gap-2 rounded-md text-sm font-medium text-mist-200 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60 ${compact ? 'px-2.5' : 'px-3'}`}
    >
      {basket.phase === 'working' && !basket.pendingIdent ? <Spinner size={16} /> : <UserIcon size={18} />}
      <span className={compact ? 'sr-only sm:not-sr-only' : ''}>Log in</span>
    </button>
  )
}

function BasketButton() {
  const basket = useBasket()
  const { snapshotAt } = useCatalog()
  if (!basket.enabled || snapshotAt) return null
  const count = basket.itemCount
  return (
    <button
      type="button"
      onClick={basket.openDrawer}
      className="relative flex h-10 w-10 items-center justify-center rounded-md text-mist-200 transition-colors hover:bg-white/5 hover:text-white"
      aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <BasketIcon size={21} />
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-bold leading-none text-white">
          {count}
        </span>
      ) : null}
    </button>
  )
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-white after:absolute after:inset-x-3 after:-bottom-[15px] after:h-0.5 after:bg-accent-500' : 'text-mist-300 hover:text-white'
  }`

export function Header() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const transparentAtTop = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const solid = scrolled || menuOpen || !transparentAtTop
  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid ? 'border-ink-700/80 bg-ink-950/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <ServerBar />
      <Container className="flex h-[72px] items-center gap-4">
        <Brand onNavigate={closeMenu} />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          {site.links.discord ? (
            <a
              href={site.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-mist-300 transition-colors hover:text-white"
            >
              <DiscordIcon size={18} />
              Discord
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden sm:block">
            <AccountButton />
          </div>
          <BasketButton />
          <button
            type="button"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-md text-mist-200 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </Container>

      <SnapshotNotice />

      {menuOpen ? (
        <div id="mobile-menu" className="max-h-[calc(100dvh-112px)] overflow-y-auto border-t border-ink-700 bg-ink-950 lg:hidden">
          <Container className="py-4">
            <nav aria-label="Mobile">
              <ul className="divide-y divide-ink-800">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between py-4 font-display text-2xl font-semibold uppercase tracking-wide ${isActive ? 'text-white' : 'text-mist-300'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                {site.links.discord ? (
                  <li>
                    <a
                      href={site.links.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMenu}
                      className="flex items-center gap-3 py-4 font-display text-2xl font-semibold uppercase tracking-wide text-mist-300"
                    >
                      <DiscordIcon size={22} />
                      Discord support
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
            <div className="mt-4 border-t border-ink-800 pt-4 sm:hidden">
              <AccountButton />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
