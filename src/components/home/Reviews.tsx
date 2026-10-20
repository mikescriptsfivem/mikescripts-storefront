import { site } from '../../config/site'
import { Container, SectionHeading } from '../ui/layout'

/** Genuine customer reviews from site.reviews. Renders nothing until reviews are configured. */
export function Reviews() {
  if (site.reviews.length === 0) return null
  return (
    <section aria-labelledby="reviews-heading" className="py-24 sm:py-32">
      <Container>
        <SectionHeading id="reviews-heading" eyebrow="Reviews" title="From server owners" />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {site.reviews.map((review) => (
            <li key={`${review.author}-${review.text.slice(0, 24)}`} className="flex flex-col rounded-lg border border-ink-700 bg-ink-900 p-6">
              <blockquote className="flex-1 text-[15px] leading-relaxed text-mist-300">“{review.text}”</blockquote>
              <p className="mt-6 text-sm font-semibold text-white">{review.author}</p>
              {review.product || review.source ? (
                <p className="mt-1 text-xs text-mist-500">{[review.product, review.source].filter(Boolean).join(' · ')}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
