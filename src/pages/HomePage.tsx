import { About } from '../components/home/About'
import { CategoryTiles } from '../components/home/CategoryTiles'
import { Faq } from '../components/home/Faq'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { FeaturedRelease } from '../components/home/FeaturedRelease'
import { Hero } from '../components/home/Hero'
import { Reviews } from '../components/home/Reviews'
import { ShowcaseTeaser } from '../components/home/ShowcaseTeaser'
import { Container, SectionHeading } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCatalog } from '../state/catalog-context'

function HomeCategories() {
  const { catalog } = useCatalog()
  const topLevel = catalog?.categories.filter((category) => category.parentId === null && category.productIdents.length > 0) ?? []
  if (!catalog || topLevel.length < 2) return null
  return (
    <section aria-labelledby="categories-heading" className="pb-24 sm:pb-32">
      <Container>
        <SectionHeading id="categories-heading" eyebrow="Categories" title="Browse by category" action={{ label: 'All categories', to: '/categories' }} />
        <div className="mt-12">
          <CategoryTiles catalog={catalog} categories={topLevel.slice(0, 6)} />
        </div>
      </Container>
    </section>
  )
}

export default function HomePage() {
  usePageMeta()
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <HomeCategories />
      <FeaturedRelease />
      <ShowcaseTeaser />
      <About />
      <Reviews />
      <Faq />
    </>
  )
}
