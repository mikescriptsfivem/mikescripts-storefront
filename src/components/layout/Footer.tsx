import { Link } from 'react-router'
import { site } from '../../config/site'
import { useCatalog } from '../../state/catalog-context'
import { Container } from '../ui/layout'
import { DiscordIcon, ExternalIcon } from '../ui/icons'
import { Brand } from './Brand'

interface FooterLink {
  label: string
  to: string
  external?: boolean
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mist-500">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-mist-300 transition-colors hover:text-white"
              >
                {link.label}
                <ExternalIcon size={13} className="opacity-60" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link to={link.to} className="text-sm text-mist-300 transition-colors hover:text-white">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const { pages } = useCatalog()
  const { links } = site

  const store: FooterLink[] = [
    { label: 'All scripts', to: '/scripts' },
    { label: 'Categories', to: '/categories' },
    { label: 'Showcase', to: '/showcase' },
    { label: 'Official Tebex store', to: links.store, external: true },
  ]
  const support: FooterLink[] = [
    { label: 'Documentation', to: '/docs' },
    ...(links.documentation ? [{ label: 'Full documentation', to: links.documentation, external: true }] : []),
    { label: 'FAQ', to: '/faq' },
    ...(links.discord ? [{ label: 'Discord support', to: links.discord, external: true }] : []),
    { label: 'Cfx.re Portal', to: links.cfxPortal, external: true },
  ]
  const legal: FooterLink[] = [
    ...pages.map((page) => ({ label: page.title, to: `/pages/${page.slug}` })),
    ...(links.refundPolicy ? [{ label: 'Refund policy', to: links.refundPolicy, external: true }] : []),
    { label: 'Tebex checkout terms', to: links.tebexTerms, external: true },
    { label: 'Privacy policy', to: links.tebexPrivacy, external: true },
    { label: 'Impressum', to: links.tebexImpressum, external: true },
  ]

  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-5 text-sm leading-relaxed text-mist-400">{site.description}</p>
            {links.discord ? (
              <a
                href={links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-ink-600 px-4 py-2.5 text-sm font-medium text-mist-200 transition-colors hover:border-mist-400 hover:text-white"
              >
                <DiscordIcon size={18} />
                Join the Discord
              </a>
            ) : null}
          </div>
          <FooterColumn title="Store" links={store} />
          <FooterColumn title="Support" links={support} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        <div className="mt-14 space-y-3 border-t border-ink-700 pt-8 text-xs leading-relaxed text-mist-500">
          <p>
            Tebex Limited is the reseller and merchant of record for purchases made through this store. Checkout, payment and billing support
            are handled by Tebex.
          </p>
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved. {site.name} is not affiliated with or endorsed by Rockstar Games,
            Take-Two Interactive or Cfx.re.
          </p>
        </div>
      </Container>
    </footer>
  )
}
