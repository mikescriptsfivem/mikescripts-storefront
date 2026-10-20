import { Link, useParams } from 'react-router'
import { LinkButton } from '../components/ui/Button'
import { ArrowLeftIcon, ArrowRightIcon, BookIcon, ExternalIcon } from '../components/ui/icons'
import { Container, Eyebrow, PageHeader } from '../components/ui/layout'
import { RichText } from '../components/ui/RichText'
import { site } from '../config/site'
import { guides, type DocBlock, type DocGuide } from '../content/docs'
import { usePageMeta } from '../hooks/usePageMeta'
import { slugify } from '../lib/slug'
import { useCatalog } from '../state/catalog-context'
import NotFoundPage from './NotFoundPage'

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-[15px] leading-relaxed text-mist-300">
          <RichText text={block.text} />
        </p>
      )
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag className={`space-y-2 pl-5 text-[15px] leading-relaxed text-mist-300 marker:text-accent-500 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </Tag>
      )
    }
    case 'code':
      return (
        <figure className="overflow-hidden rounded-md border border-ink-700 bg-ink-900">
          {block.label ? <figcaption className="border-b border-ink-700 px-4 py-2 text-xs font-medium uppercase tracking-wider text-mist-500">{block.label}</figcaption> : null}
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-mist-50">
            <code>{block.code}</code>
          </pre>
        </figure>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-md border border-ink-700">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-ink-850 text-white">
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, index) => (
                    <td key={index} className="px-4 py-3 align-top text-mist-300">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

function GuideView({ guide }: { guide: DocGuide }) {
  const { catalog } = useCatalog()
  const product = guide.productKey ? catalog?.byContentKey.get(guide.productKey) : undefined
  usePageMeta(`${guide.title} guide`, guide.summary)
  const index = guides.indexOf(guide)
  const next = guides[index + 1]

  return (
    <>
      <PageHeader eyebrow="Documentation" title={guide.title} description={guide.summary}>
        <Link to="/docs" className="mb-8 inline-flex items-center gap-2 text-sm text-mist-400 hover:text-white">
          <ArrowLeftIcon size={16} />
          All guides
        </Link>
      </PageHeader>
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="sticky top-40 space-y-1 border-l border-ink-700">
              {guide.sections.map((section) => (
                <li key={section.heading}>
                  <a href={`#${slugify(section.heading)}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-mist-400 hover:border-mist-400 hover:text-white">
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <article className="min-w-0 max-w-3xl">
            {guide.sections.map((section) => (
              <section key={section.heading} className="border-t border-ink-700 py-10 first:border-t-0 first:pt-0">
                <h2 id={slugify(section.heading)} className="scroll-mt-40 font-display text-3xl font-semibold uppercase tracking-wide text-white">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, blockIndex) => (
                    <Block key={blockIndex} block={block} />
                  ))}
                </div>
              </section>
            ))}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink-700 pt-10">
              {product ? (
                <LinkButton to={`/scripts/${product.slug}`}>
                  View {product.title}
                  <ArrowRightIcon size={16} />
                </LinkButton>
              ) : null}
              {next ? (
                <LinkButton to={`/docs/${next.id}`} variant="secondary">
                  Next: {next.title}
                </LinkButton>
              ) : null}
            </div>
          </article>
        </div>
      </Container>
    </>
  )
}

export default function DocsPage() {
  const { guideId } = useParams()
  if (!guideId) return <DocsIndex />
  const guide = guides.find((item) => item.id === guideId)
  return guide ? <GuideView key={guide.id} guide={guide} /> : <NotFoundPage title="Guide not found" text="That guide does not exist. Browse all installation guides instead." />
}

function DocsIndex() {
  usePageMeta('Documentation', 'Installation guides for MikeScripts FiveM resources.')
  const { status, catalog } = useCatalog()
  // Product guides appear once the product is live. If the catalogue can't load, keep every guide reachable.
  const visible = guides.filter((guide) => !guide.productKey || status !== 'ready' || catalog?.byContentKey.has(guide.productKey))
  return (
    <>
      <PageHeader eyebrow="Documentation" title="Installation guides" description="How to buy, download, install and configure MikeScripts resources on your FiveM server." />
      <Container className="py-12 sm:py-16">
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((guide) => (
            <li key={guide.id}>
              <Link to={`/docs/${guide.id}`} className="group flex h-full gap-5 rounded-lg border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-ink-500">
                <BookIcon size={24} className="mt-1 shrink-0 text-accent-400" />
                <span className="flex-1">
                  <span className="block font-display text-2xl font-semibold uppercase tracking-wide text-white">{guide.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-mist-400">{guide.summary}</span>
                </span>
                <ArrowRightIcon size={18} className="mt-2 shrink-0 text-mist-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            </li>
          ))}
        </ul>
        {site.links.documentation ? (
          <div className="mt-10">
            <Eyebrow className="mb-4">More</Eyebrow>
            <LinkButton to={site.links.documentation} variant="secondary">
              Full documentation site
              <ExternalIcon size={16} />
            </LinkButton>
          </div>
        ) : null}
      </Container>
    </>
  )
}
