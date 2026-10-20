/** Formats a Tebex amount in its currency, e.g. formatPrice(24.99, 'USD') → "$24.99". */
export function formatPrice(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
