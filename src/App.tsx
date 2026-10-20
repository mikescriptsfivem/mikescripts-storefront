import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/layout/Layout'
import { env } from './config/env'
import CatalogPage from './pages/CatalogPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { BasketProvider } from './state/BasketProvider'
import { CatalogProvider } from './state/CatalogProvider'

// Less-visited pages load on demand to keep the first page light.
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const BasketPage = lazy(() => import('./pages/BasketPage'))
const CheckoutCompletePage = lazy(() => import('./pages/CheckoutCompletePage'))
const CmsPage = lazy(() => import('./pages/CmsPage'))

/**
 * Routes. Keep scripts/prerender-routes.mjs in sync when adding a top-level page,
 * so GitHub Pages serves it with a 200 status and its own title.
 */
const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'scripts', element: <CatalogPage /> },
        { path: 'scripts/:slug', element: <ProductPage /> },
        { path: 'categories', element: <CategoriesPage /> },
        { path: 'showcase', element: <ShowcasePage /> },
        { path: 'docs', element: <DocsPage /> },
        { path: 'docs/:guideId', element: <DocsPage /> },
        { path: 'faq', element: <FaqPage /> },
        { path: 'basket', element: <BasketPage /> },
        { path: 'checkout/complete', element: <CheckoutCompletePage /> },
        { path: 'pages/:slug', element: <CmsPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: env.baseUrl.replace(/\/$/, '') || '/' },
)

export default function App() {
  return (
    <CatalogProvider>
      <BasketProvider>
        <RouterProvider router={router} />
      </BasketProvider>
    </CatalogProvider>
  )
}
