import { useMemo } from 'react'
import { useParams } from 'react-router'
import { StoreStatus } from '../components/StoreStatus'
import { Skeleton } from '../components/ui/feedback'
import { Container, PageHeader } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'
import { enhanceDescription } from '../lib/enhance-description'
import { sanitizeHtml } from '../lib/sanitize'
import type { TebexCmsPage } from '../lib/tebex/types'
import { useCatalog } from '../state/catalog-context'
import NotFoundPage from './NotFoundPage'

function CmsContent({ page }: { page: TebexCmsPage }) {
  usePageMeta(page.title)
  const html = useMemo(() => enhanceDescription(sanitizeHtml(page.content ?? '')), [page.content])
  return (
    <>
      <PageHeader title={page.title} />
      <Container className="py-12 sm:py-16">
        {/* Sanitised with DOMPurify (sanitizeHtml), then Markdown-enhanced with DOM APIs only. */}
        <div className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </>
  )
}

/** Custom pages created in the Tebex panel (Webstore → Pages), e.g. terms or a refund policy. */
export default function CmsPage() {
  const { slug } = useParams()
  const { status, pages } = useCatalog()

  if (status === 'ready') {
    const page = pages.find((item) => item.slug === slug)
    return page ? <CmsContent key={page.id} page={page} /> : <NotFoundPage />
  }
  return (
    <Container className="pb-24 pt-48">
      {status === 'loading' ? (
        <div role="status" className="space-y-4">
          <span className="sr-only">Loading page…</span>
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <StoreStatus />
      )}
    </Container>
  )
}
