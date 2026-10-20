import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { AuthChooser, BasketDrawer, BasketToaster } from '../basket/BasketOverlays'
import { Spinner } from '../ui/icons'
import { Footer } from './Footer'
import { Header } from './Header'

function PageLoader() {
  return (
    <div role="status" className="flex min-h-[70vh] items-center justify-center pt-20 text-mist-500">
      <Spinner size={28} />
      <span className="sr-only">Loading page…</span>
    </div>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BasketDrawer />
      <AuthChooser />
      <BasketToaster />
      <ScrollRestoration />
    </div>
  )
}
