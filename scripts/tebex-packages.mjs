/**
 * Lists every package in your Tebex store with the identifiers you can use in src/config/products.ts.
 * Usage: npm run tebex:packages   (reads VITE_TEBEX_PUBLIC_TOKEN from .env.local or the environment)
 */
import { loadEnv } from 'vite'

const env = loadEnv('development', process.cwd(), 'VITE_')
const token = (env.VITE_TEBEX_PUBLIC_TOKEN ?? '').trim()

if (!token) {
  console.error('VITE_TEBEX_PUBLIC_TOKEN is not set. Add your Tebex public token to .env.local first (see README.md).')
  process.exit(1)
}

const response = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/categories?includePackages=1`, {
  headers: { Accept: 'application/json' },
})
const payload = await response.json().catch(() => ({}))
if (!response.ok) {
  console.error(`Tebex returned HTTP ${response.status}: ${payload.detail ?? payload.title ?? 'unknown error'}`)
  process.exit(1)
}

const rows = []
for (const category of payload.data ?? []) {
  for (const pkg of category.packages ?? []) {
    rows.push({
      category: category.name,
      ident: pkg.ident,
      id: pkg.id,
      slug: pkg.slug ?? '',
      name: pkg.name,
      price: `${pkg.total_price} ${pkg.currency}`,
    })
  }
}

if (rows.length === 0) {
  console.log('Connected to Tebex, but the store has no packages yet.')
} else {
  console.table(rows)
  console.log('\nPin a product in src/config/products.ts with, for example:  tebex: { ident: \'' + rows[0].ident + '\' }')
}
