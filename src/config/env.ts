/** Build-time configuration. All of these values are public (they ship in the website bundle). */
const tebexPublicToken = (import.meta.env.VITE_TEBEX_PUBLIC_TOKEN ?? '').trim()

export const env = {
  /** Tebex Headless API public token. Never a private key. */
  tebexPublicToken,
  isTebexConfigured: tebexPublicToken.length > 0,
  /** Base path the app is served from, always ending in "/" (e.g. "/mikescripts-storefront/"). */
  baseUrl: import.meta.env.BASE_URL,
  isDev: import.meta.env.DEV,
} as const
