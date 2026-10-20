import { Link } from 'react-router'
import { site } from '../../config/site'
import { useCatalog } from '../../state/catalog-context'
import { Container, Eyebrow } from '../ui/layout'
import { ArrowRightIcon, PlaneIcon, SeatIcon, SirenIcon, TruckIcon } from '../ui/icons'
import { Picture } from '../ui/Picture'
import { Reveal } from '../ui/Reveal'

const PILLAR_ICONS = [PlaneIcon, SeatIcon, SirenIcon, TruckIcon]

export function About() {
  const { catalog } = useCatalog()
  const { about } = site

  return (
    <section aria-labelledby="about-heading" className="border-t border-ink-700 bg-ink-900 py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>About MikeScripts</Eyebrow>
          <h2 id="about-heading" className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl">
            {about.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-mist-400 sm:text-lg">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-10 divide-y divide-ink-700 border-y border-ink-700">
            {about.pillars.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length] ?? PlaneIcon
              const product = catalog?.byContentKey.get(pillar.productKey)
              const body = (
                <>
                  <Icon size={22} className="mt-0.5 shrink-0 text-accent-400" />
                  <span className="flex-1">
                    <span className="block font-semibold text-white">{pillar.title}</span>
                    <span className="mt-1 block text-sm text-mist-400">{pillar.text}</span>
                  </span>
                </>
              )
              return (
                <li key={pillar.title}>
                  {product ? (
                    <Link to={`/scripts/${product.slug}`} className="group flex items-start gap-4 py-5">
                      {body}
                      <ArrowRightIcon size={18} className="mt-1 shrink-0 text-mist-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4 py-5">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </Reveal>
        <Reveal delay={100} className="overflow-hidden rounded-lg border border-ink-700">
          <Picture id={about.image} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] h-full w-full object-cover" />
        </Reveal>
      </Container>
    </section>
  )
}
