export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Labels may wrap on narrow screens (min-height, not a fixed height), so long product names never overflow.
const base =
  'inline-flex max-w-full select-none items-center justify-center gap-2 rounded-md text-center font-semibold leading-tight tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-400 text-ink-950 shadow-[0_10px_30px_rgba(249,115,22,0.22)] hover:bg-accent-500 active:bg-accent-600 active:text-white',
  secondary: 'border border-ink-500 bg-ink-950/40 text-mist-50 backdrop-blur hover:border-mist-400 hover:bg-white/5',
  ghost: 'text-mist-300 hover:bg-white/5 hover:text-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-[13px]',
  md: 'min-h-11 px-5 py-2 text-sm',
  lg: 'min-h-13 px-7 py-2.5 text-[15px]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}
