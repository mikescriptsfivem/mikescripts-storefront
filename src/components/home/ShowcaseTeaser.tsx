import { Link } from 'react-router'
import type { MediaId } from '../../config/media'
import { Container, SectionHeading } from '../ui/layout'
import { Picture } from '../ui/Picture'
import { Reveal } from '../ui/Reveal'

const TILES: { id: MediaId; caption: string; anchor: string }[] = [
  { id: 'ms8000/lounge-evening', caption: 'MS8000 · Entertainment lounge', anchor: 'ms8000' },
  { id: 'ms100/apron-aerial', caption: 'MS-100 · With the MS-E fleet', anchor: 'ms100' },
  { id: 'mse/lineup-front34', caption: 'MS-E · Ground support fleet', anchor: 'mse' },
]

export function ShowcaseTeaser() {
  const [main, ...side] = TILES
  return (
    <section aria-labelledby="showcase-heading" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          id="showcase-heading"
          eyebrow="Showcase"
          title="Built in detail"
          description="Renders and screenshots of MikeScripts releases, from walkable cabins to the fleets that service them."
          action={{ label: 'Open the showcase', to: '/showcase' }}
        />
        <Reveal className="mt-12 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {main ? <Tile {...main} large /> : null}
          <div className="grid gap-4">
            {side.map((tile) => (
              <Tile key={tile.id} {...tile} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Tile({ id, caption, anchor, large = false }: { id: MediaId; caption: string; anchor: string; large?: boolean }) {
  return (
    <Link
      to={`/showcase#${anchor}`}
      className={`group relative block overflow-hidden rounded-lg border border-ink-700 bg-ink-850 ${large ? 'aspect-[16/10] lg:aspect-auto lg:h-full' : 'aspect-[16/9]'}`}
    >
      <Picture
        id={id}
        sizes={large ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 38vw, 100vw'}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/90 to-transparent" />
      <span className="absolute bottom-4 left-5 text-sm font-medium text-white">{caption}</span>
    </Link>
  )
}
