import { site } from '../../config/site'
import { Container, SectionHeading } from '../ui/layout'
import { ChevronDownIcon } from '../ui/icons'
import { RichText } from '../ui/RichText'

/** FAQ accordion built on native <details>, so it works with keyboard and screen readers out of the box. */
export function FaqList() {
  return (
    <div className="divide-y divide-ink-700 border-y border-ink-700">
      {site.faq.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-medium text-white transition-colors hover:text-accent-300">
            {item.question}
            <ChevronDownIcon size={20} className="shrink-0 text-mist-500 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="-mt-1 max-w-3xl space-y-3 pb-7 text-[15px] leading-relaxed text-mist-400">
            {item.answer.map((paragraph) => (
              <p key={paragraph}>
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="py-24 sm:py-32">
      <Container className="grid items-start gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <div className="lg:sticky lg:top-40">
          <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions & answers" description="Buying, downloading, installing and updating MikeScripts resources." />
        </div>
        <FaqList />
      </Container>
    </section>
  )
}
