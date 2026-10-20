import { FaqList } from '../components/home/Faq'
import { Container, PageHeader } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'

export default function FaqPage() {
  usePageMeta('FAQ', 'Answers about buying, downloading, installing and updating MikeScripts FiveM resources.')
  return (
    <>
      <PageHeader eyebrow="Support" title="Frequently asked questions" description="Buying, downloading, installing and updating MikeScripts resources." />
      <Container className="py-12 sm:py-16">
        <div className="max-w-4xl">
          <FaqList />
        </div>
      </Container>
    </>
  )
}
