import { site } from '../../config/site'
import { LinkButton } from '../ui/Button'
import { Container, Eyebrow } from '../ui/layout'
import { ArrowRightIcon, DiscordIcon } from '../ui/icons'
import { Picture } from '../ui/Picture'

export function Hero() {
  const { hero, links } = site
  return (
    <section className="relative isolate flex min-h-[800px] items-end overflow-hidden bg-ink-950 sm:min-h-[820px] lg:min-h-[min(100dvh,960px)]">
      {/* Small screens: artwork across the top, fading into the headline. Large screens: artwork on the right. */}
      <div className="absolute right-0 top-0 -z-20 h-[50%] w-full sm:h-[62%] lg:inset-y-0 lg:h-full lg:w-[82%] lg:[mask-image:linear-gradient(to_right,transparent,#000_30%)]">
        <Picture id={hero.image} priority sizes="100vw" className="h-full w-full object-cover object-[60%_center]" />
      </div>
      {/* Scrims keep the headline readable over the artwork. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-[22%] -z-10 h-[36%] bg-gradient-to-b from-transparent to-ink-950 sm:top-[30%] sm:h-[34%] lg:hidden" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-ink-950 via-ink-950/55 to-ink-950/5 lg:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ink-950 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-ink-950/80 to-transparent" />

      <Container className="pb-16 pt-36 sm:pb-24 lg:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mt-6 text-balance font-display text-[clamp(3.4rem,9vw,7.75rem)] font-bold uppercase leading-[0.86] tracking-[0.005em] text-white">
            {hero.headline}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist-300 sm:text-xl">{hero.text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton to="/scripts" size="lg">
              Explore Scripts
              <ArrowRightIcon size={18} />
            </LinkButton>
            {links.discord ? (
              <LinkButton to={links.discord} variant="secondary" size="lg">
                <DiscordIcon size={18} />
                Join Discord
                <span className="sr-only">(opens in a new tab)</span>
              </LinkButton>
            ) : (
              <LinkButton to="/showcase" variant="secondary" size="lg">
                View Showcase
              </LinkButton>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
