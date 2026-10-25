import { site } from '../../config/site'
import { LinkButton } from '../ui/Button'
import { Container, Eyebrow } from '../ui/layout'
import { ArrowRightIcon, DiscordIcon } from '../ui/icons'
import { Picture } from '../ui/Picture'
import { FeaturedRotator } from './FeaturedRotator'

export function Hero() {
  const { hero, links } = site
  return (
    <section className="relative isolate flex min-h-[720px] items-center overflow-hidden border-b border-white/5 bg-ink-950 lg:min-h-[760px]">
      <div className="absolute inset-0 -z-20">
        <Picture id={hero.image} priority sizes="100vw" className="h-full w-full object-cover object-[70%_center]" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'linear-gradient(90deg, rgba(8,9,11,0.94) 0%, rgba(8,9,11,0.78) 38%, rgba(8,9,11,0.45) 68%, rgba(8,9,11,0.72) 100%)',
            'linear-gradient(0deg, rgba(8,9,11,0.96) 0%, rgba(8,9,11,0.28) 42%, rgba(8,9,11,0.55) 100%)',
            'radial-gradient(ellipse 60% 50% at 75% 40%, rgba(249,115,22,0.12), transparent 70%)',
          ].join(', '),
        }}
      />

      <Container className="grid items-center gap-8 pb-14 pt-40 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-10 lg:pb-16 lg:pt-44">
        <div className="max-w-xl animate-fade-up">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mt-3 whitespace-pre-line font-display text-[clamp(2.25rem,6.2vw,3.625rem)] font-bold uppercase leading-[0.98] tracking-[0.02em] text-white">
            {hero.headline}
          </h1>
          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-mist-300">{hero.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
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
        <FeaturedRotator />
      </Container>
    </section>
  )
}
