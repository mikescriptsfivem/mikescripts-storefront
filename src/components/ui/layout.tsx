import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRightIcon } from './icons'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-400 ${className}`}>
      <span aria-hidden="true" className="h-px w-6 bg-accent-500" />
      {children}
    </p>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  action?: { label: string; to: string }
  as?: 'h1' | 'h2'
  id?: string
}

export function SectionHeading({ eyebrow, title, description, action, as: Tag = 'h2', id }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        <Tag id={id} className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl">
          {title}
        </Tag>
        {description ? <p className="mt-4 text-base leading-relaxed text-mist-400">{description}</p> : null}
      </div>
      {action ? (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-mist-200 transition-colors hover:text-white"
        >
          {action.label}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  )
}

/** Page header band used by inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  /** Rendered above the title (e.g. a back link). */
  children?: ReactNode
  /** Rendered below the description (e.g. jump links). */
  footer?: ReactNode
}) {
  return (
    <header className="border-b border-ink-700 bg-ink-900 pb-12 pt-44 sm:pb-14 sm:pt-48">
      <Container>
        {children}
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        <h1 className="font-display text-5xl font-semibold uppercase leading-[0.92] tracking-wide text-white sm:text-6xl">{title}</h1>
        {description ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist-400 sm:text-lg">{description}</p> : null}
        {footer ? <div className="mt-8">{footer}</div> : null}
      </Container>
    </header>
  )
}

export function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' }) {
  const tones = {
    default: 'border-ink-600 bg-ink-850 text-mist-300',
    accent: 'border-accent-600/50 bg-accent-600/10 text-accent-300',
  }
  return <span className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
