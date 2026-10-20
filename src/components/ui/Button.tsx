import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { isExternalUrl } from '../../lib/url'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-styles'
import { Spinner } from './icons'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean
    loadingLabel?: string
  }

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  loadingLabel,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size={16} /> : null}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  )
}

type LinkButtonProps = CommonProps & {
  /** Internal route ("/scripts") or external URL ("https://…"). External links open in a new tab. */
  to: string
  ariaLabel?: string
  newTab?: boolean
}

export function LinkButton({ to, variant = 'primary', size = 'md', className = '', ariaLabel, newTab, children }: LinkButtonProps) {
  const classes = buttonClasses(variant, size, className)
  if (isExternalUrl(to)) {
    const openInNewTab = newTab ?? true
    return (
      <a
        href={to}
        className={classes}
        aria-label={ariaLabel}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}
