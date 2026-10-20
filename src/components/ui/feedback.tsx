import type { ReactNode } from 'react'
import { AlertIcon, InfoIcon } from './icons'

interface NoticeProps {
  tone?: 'info' | 'error'
  title: string
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Inline status message for loading problems, empty results and configuration notes. */
export function Notice({ tone = 'info', title, children, actions, className = '' }: NoticeProps) {
  const Icon = tone === 'error' ? AlertIcon : InfoIcon
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border p-6 sm:p-8 ${tone === 'error' ? 'border-danger-500/30 bg-danger-500/[0.06]' : 'border-ink-600 bg-ink-850'} ${className}`}
    >
      <div className="flex gap-4">
        <Icon size={22} className={`mt-0.5 shrink-0 ${tone === 'error' ? 'text-danger-400' : 'text-accent-400'}`} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{title}</p>
          {children ? <div className="mt-2 text-sm leading-relaxed text-mist-400">{children}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-ink-800 ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 6, label = 'Loading scripts' }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
