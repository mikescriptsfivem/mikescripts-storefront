import { useMemo, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { PriceTag } from '../components/product/PriceTag'
import { ProductCard } from '../components/product/ProductCard'
import { ProductGallery } from '../components/product/ProductGallery'
import { PurchaseActions } from '../components/product/PurchaseActions'
import { StoreStatus } from '../components/StoreStatus'
import { LinkButton } from '../components/ui/Button'
import { Skeleton } from '../components/ui/feedback'
import { BookIcon, CheckIcon, ExternalIcon, LockIcon } from '../components/ui/icons'
import { Chip, Container, Eyebrow } from '../components/ui/layout'
import { Picture } from '../components/ui/Picture'
import { guides } from '../content/docs'
import { usePageMeta } from '../hooks/usePageMeta'
import { relatedProducts, type Product } from '../lib/catalog'
import { truncate } from '../lib/html'
import { enhanceDescription } from '../lib/enhance-description'
import { sanitizeHtml } from '../lib/sanitize'
import { youtubeId } from '../lib/url'
import { useBasket } from '../state/basket-context'
import { useCatalog } from '../state/catalog-context'
import NotFoundPage from './NotFoundPage'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t border-ink-700 py-12 first:border-t-0 first:pt-0">
      <h2 id={`${id}-heading`} className="font-display text-3xl font-semibold uppercase tracking-wide text-white">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-mist-300">
          <CheckIcon size={18} className="mt-1 shrink-0 text-accent-400" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function ProductDetails({ product }: { product: Product }) {
  const { catalog } = useCatalog()
  const basket = useBasket()
  const content = product.content
  const description = useMemo(() => enhanceDescription(sanitizeHtml(product.descriptionHtml)), [product.descriptionHtml])
  const videoId = content?.video?.youtubeId ?? youtubeId(product.videoUrl)
  const related = catalog ? relatedProducts(catalog, product) : []
  const guide = content?.docsGuide ? guides.find((item) => item.id === content.docsGuide) : undefined
  const category = catalog?.categoryById.get(product.categoryId)

  usePageMeta(product.name, truncate(product.summary, 160))

  const sections = [
    description ? { id: 'overview', title: 'Overview' } : null,
    videoId ? { id: 'video', title: 'Video' } : null,
    content?.includes?.length ? { id: 'included', title: 'Included' } : null,
    content?.features?.length ? { id: 'features', title: 'Features' } : null,
    content?.requirements || content?.frameworks?.length ? { id: 'requirements', title: 'Requirements' } : null,
    guide || content?.documentationUrl ? { id: 'installation', title: 'Installation' } : null,
    content?.changelog?.length ? { id: 'changelog', title: 'Changelog' } : null,
  ].filter((item): item is { id: string; title: string } => item !== null)

  return (
    <>
      <div className="border-b border-ink-700 bg-ink-900 pb-14 pt-28 sm:pt-32">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-mist-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/scripts" className="hover:text-white">
                  All scripts
                </Link>
              </li>
              {category ? (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link to={`/scripts?category=${encodeURIComponent(category.slug)}`} className="hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-[16rem] truncate text-mist-300">
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
            <ProductGallery product={product} />

            <div className="lg:pt-2">
              <Eyebrow>{product.categoryName}</Eyebrow>
              <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl">{product.title}</h1>
              {product.title !== product.name ? <p className="mt-3 text-sm text-mist-500">{product.name}</p> : null}
              {content?.tagline ? <p className="mt-4 text-lg leading-relaxed text-mist-300">{content.tagline}</p> : null}

              <div className="mt-8">
                <PriceTag price={product.price} type={product.type} size="lg" />
                {product.type === 'subscription' ? <p className="mt-1 text-sm text-mist-500">Subscription. Billing details are shown at checkout.</p> : null}
              </div>

              <div className="mt-6">
                {basket.enabled ? (
                  <PurchaseActions product={product} />
                ) : null}
              </div>

              <ul className="mt-6 space-y-2 text-sm text-mist-400">
                {!basket.isAuthorized && !product.requiresInput ? (
                  <li className="flex gap-2.5">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-accent-400" />
                    You’ll log in with your Cfx.re account first. The script is delivered to that account.
                  </li>
                ) : null}
                <li className="flex gap-2.5">
                  <LockIcon size={16} className="mt-0.5 shrink-0 text-accent-400" />
                  Secure checkout on Tebex. The final price, including any taxes, is confirmed there.
                </li>
              </ul>

              {content?.compatibility?.length ? (
                <div className="mt-8 flex flex-wrap gap-2" aria-label="Compatibility">
                  {content.compatibility.map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </div>
              ) : null}

              {guide ? (
                <Link to={`/docs/${guide.id}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-400 hover:text-accent-300">
                  <BookIcon size={18} />
                  Installation guide
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          {sections.length > 1 ? (
            <nav aria-label="On this page" className="hidden lg:block">
              <ul className="sticky top-28 space-y-1 border-l border-ink-700">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}-heading`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-mist-400 hover:border-mist-400 hover:text-white">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div className="min-w-0 max-w-3xl">
            {description ? (
              <Section id="overview" title="Overview">
                {/* Sanitised with DOMPurify (sanitizeHtml), then Markdown-enhanced with DOM APIs only. */}
                <div className="prose-store" dangerouslySetInnerHTML={{ __html: description }} />
              </Section>
            ) : null}

            {videoId ? (
              <Section id="video" title="Video">
                <div className="aspect-video overflow-hidden rounded-lg border border-ink-700">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
                    title={content?.video?.title ?? `${product.title} video`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </Section>
            ) : null}

            {content?.includes?.length ? (
              <Section id="included" title="Included in this package">
                <div className="grid gap-6 sm:grid-cols-2">
                  {content.includes.map((item) => (
                    <article key={item.title} className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
                      {item.image ? <Picture id={item.image} sizes="(min-width: 1024px) 24rem, 100vw" className="aspect-[16/9] w-full object-cover" /> : null}
                      <div className="p-5">
                        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-mist-400">{item.summary}</p>
                        {item.highlights?.length ? (
                          <div className="mt-4">
                            <CheckList items={item.highlights} />
                          </div>
                        ) : null}
                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                          {item.docsGuide ? (
                            <Link to={`/docs/${item.docsGuide}`} className="text-accent-400 hover:text-accent-300">
                              {item.title} guide
                            </Link>
                          ) : null}
                          {item.showcase ? (
                            <Link to={`/showcase#${item.showcase}`} className="text-accent-400 hover:text-accent-300">
                              Gallery
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </Section>
            ) : null}

            {content?.features?.length ? (
              <Section id="features" title="Features">
                <div className="grid gap-10 sm:grid-cols-2">
                  {content.features.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">{group.title}</h3>
                      <CheckList items={group.items} />
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {content?.requirements || content?.frameworks?.length ? (
              <Section id="requirements" title="Requirements">
                <div className="grid gap-10 sm:grid-cols-2">
                  {content.requirements?.required.length ? (
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Required</h3>
                      <CheckList items={content.requirements.required} />
                    </div>
                  ) : null}
                  {content.requirements?.optional?.length ? (
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Optional</h3>
                      <CheckList items={content.requirements.optional} />
                    </div>
                  ) : null}
                  {content.frameworks?.length ? (
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Frameworks</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.frameworks.map((framework) => (
                          <Chip key={framework} tone="accent">
                            {framework}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {guide || content?.documentationUrl ? (
              <Section id="installation" title="Installation">
                <p className="text-[15px] leading-relaxed text-mist-400">
                  {guide ? guide.summary : 'Setup instructions are in the documentation.'} Step-by-step setup, server.cfg lines and commands are in the guide.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {guide ? (
                    <LinkButton to={`/docs/${guide.id}`} variant="secondary">
                      <BookIcon size={18} />
                      Open the installation guide
                    </LinkButton>
                  ) : null}
                  {content?.documentationUrl ? (
                    <LinkButton to={content.documentationUrl} variant="secondary">
                      Full documentation
                      <ExternalIcon size={16} />
                    </LinkButton>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {content?.changelog?.length ? (
              <Section id="changelog" title="Changelog">
                <ol className="space-y-8">
                  {content.changelog.map((entry) => (
                    <li key={entry.version}>
                      <p className="flex items-baseline gap-3">
                        <span className="font-display text-xl font-semibold uppercase tracking-wide text-white">v{entry.version}</span>
                        {entry.date ? <span className="text-sm text-mist-500">{entry.date}</span> : null}
                      </p>
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-mist-400 marker:text-accent-500">
                        {entry.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="border-t border-ink-700 bg-ink-900 py-20">
          <Container>
            <h2 id="related-heading" className="font-display text-4xl font-semibold uppercase tracking-wide text-white">
              Related scripts
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.ident}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  )
}

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { status, catalog } = useCatalog()

  if (status === 'ready' && catalog) {
    const product = catalog.bySlug.get(slug) ?? catalog.byIdent.get(slug) ?? catalog.byId.get(Number(slug))
    if (!product) return <NotFoundPage title="Script not found" text="This script is not available on the store right now. It may have been renamed or removed." />
    return <ProductDetails key={product.ident} product={product} />
  }

  return (
    <Container className="pb-24 pt-32">
      {status === 'loading' ? (
        <div role="status" className="grid gap-10 lg:grid-cols-[1.45fr_1fr]">
          <span className="sr-only">Loading script…</span>
          <Skeleton className="aspect-[16/9] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-13 w-full" />
          </div>
        </div>
      ) : (
        <StoreStatus />
      )}
    </Container>
  )
}
