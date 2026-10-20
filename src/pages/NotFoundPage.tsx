import { LinkButton } from '../components/ui/Button'
import { Container, Eyebrow } from '../components/ui/layout'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage({ title = 'Page not found', text = 'The page you are looking for does not exist or has moved.' }: { title?: string; text?: string }) {
  usePageMeta(title)
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center pb-20 pt-48">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-none tracking-wide text-white sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-lg text-lg text-mist-400">{text}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton to="/scripts">Browse scripts</LinkButton>
        <LinkButton to="/" variant="secondary">
          Back to home
        </LinkButton>
      </div>
    </Container>
  )
}
