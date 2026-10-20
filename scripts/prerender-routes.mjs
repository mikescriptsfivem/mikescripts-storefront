/**
 * Post-build step for GitHub Pages (runs after `vite build`).
 *
 * GitHub Pages has no server-side routing, so this script:
 *  1. writes dist/<route>/index.html for every top-level page, each with its own <title> and description,
 *     so those URLs load with HTTP 200 and share nicely;
 *  2. when VITE_TEBEX_PUBLIC_TOKEN is set, fetches the public catalogue and writes dist/scripts/<slug>/index.html
 *     with the product name, summary and image for link previews (Discord, social). Prices are never baked in;
 *  3. copies index.html to 404.html so any other deep link still boots the app;
 *  4. writes sitemap.xml and robots.txt when VITE_SITE_URL is known.
 * Slugs, summaries and guides come from the app's own modules (loaded through Vite), so they always match the site.
 * If Tebex cannot be reached, the build still succeeds; product URLs then fall back to 404.html.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer, loadEnv } from 'vite'

const DIST = path.resolve('dist')
const SITE_NAME = 'MikeScripts'
const DEFAULT_TITLE = `${SITE_NAME} | Premium FiveM Scripts`
const DEFAULT_DESCRIPTION =
  'Premium FiveM scripts and advanced systems, built for immersive gameplay and reliable server experiences.'

const env = loadEnv('production', process.cwd(), 'VITE_')
const siteUrl = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')
const token = (env.VITE_TEBEX_PUBLIC_TOKEN ?? '').trim()

/** Keep in sync with the routes in src/App.tsx. */
const STATIC_ROUTES = [
  { path: 'scripts', title: 'All scripts', description: 'Browse every MikeScripts FiveM script with live pricing from Tebex.' },
  { path: 'categories', title: 'Categories', description: 'Browse MikeScripts FiveM scripts by category.' },
  { path: 'showcase', title: 'Showcase', description: 'Renders and screenshots of MikeScripts FiveM releases.' },
  { path: 'docs', title: 'Documentation', description: 'Installation guides for MikeScripts FiveM resources.' },
  { path: 'faq', title: 'FAQ', description: 'Answers about buying, downloading, installing and updating MikeScripts FiveM resources.' },
  { path: 'basket', title: 'Basket', noindex: true },
  { path: 'checkout/complete', title: 'Order status', noindex: true },
]

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function setMeta(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`
  const pattern = new RegExp(`<meta\\s+${attribute}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content="[^"]*"\\s*\\/?>`)
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function absoluteUrl(routePath) {
  return siteUrl ? `${siteUrl}/${routePath}` : ''
}

function renderPage(template, { title, description, routePath, image, noindex }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
  const text = description || DEFAULT_DESCRIPTION
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
  html = setMeta(html, 'name', 'description', text)
  html = setMeta(html, 'property', 'og:title', fullTitle)
  html = setMeta(html, 'property', 'og:description', text)
  if (image) html = setMeta(html, 'property', 'og:image', image)
  else if (siteUrl) html = setMeta(html, 'property', 'og:image', `${siteUrl}/brand/og-image.jpg`)
  if (siteUrl) {
    const url = absoluteUrl(routePath)
    html = setMeta(html, 'property', 'og:url', url)
    html = html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`)
  }
  if (noindex) html = html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
  return html
}

async function writeRoute(routePath, html) {
  const directory = path.join(DIST, ...routePath.split('/'))
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'index.html'), html)
}

/** Loads the app's TypeScript modules through Vite so slugs and summaries match the site exactly. */
async function loadAppModules() {
  const server = await createServer({
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  try {
    const [catalog, products, site, docs] = await Promise.all([
      server.ssrLoadModule('/src/lib/catalog.ts'),
      server.ssrLoadModule('/src/config/products.ts'),
      server.ssrLoadModule('/src/config/site.ts'),
      server.ssrLoadModule('/src/content/docs.ts'),
    ])
    return { buildCatalog: catalog.buildCatalog, productContent: products.productContent, site: site.site, guides: docs.guides }
  } finally {
    await server.close()
  }
}

async function fetchCategories() {
  if (!token) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/categories?includePackages=1`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { data } = await response.json()
    return Array.isArray(data) ? data : null
  } catch (error) {
    console.warn(`[prerender] Could not load the Tebex catalogue (${error.message}). Product pages will use the 404.html fallback.`)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------------------------

const template = await readFile(path.join(DIST, 'index.html'), 'utf8')
const home = renderPage(template, { routePath: '' })
await writeFile(path.join(DIST, 'index.html'), home)
await writeFile(path.join(DIST, '404.html'), home)

const app = await loadAppModules()
const categories = await fetchCategories()
const catalog = categories ? app.buildCatalog(categories, app.productContent, app.site.categories) : null

const written = []
for (const route of STATIC_ROUTES) {
  await writeRoute(route.path, renderPage(template, { ...route, routePath: `${route.path}/` }))
  written.push(route.path)
}

// Product guides only once the product is live (all guides when the catalogue is unknown).
for (const guide of app.guides.filter((item) => !item.productKey || !catalog || catalog.byContentKey.has(item.productKey))) {
  const routePath = `docs/${guide.id}`
  await writeRoute(routePath, renderPage(template, { title: `${guide.title} guide`, description: guide.summary, routePath: `${routePath}/` }))
  written.push(routePath)
}

for (const product of catalog?.products ?? []) {
  const routePath = `scripts/${product.slug}`
  await writeRoute(routePath, renderPage(template, { title: product.name, description: product.summary, image: product.image, routePath: `${routePath}/` }))
  written.push(routePath)
}

await writeFile(path.join(DIST, '.nojekyll'), '')
if (siteUrl) {
  const indexable = ['', ...written.filter((routePath) => !STATIC_ROUTES.find((route) => route.path === routePath && route.noindex))]
  const urls = indexable.map((routePath) => `  <url><loc>${escapeHtml(absoluteUrl(routePath ? `${routePath}/` : ''))}</loc></url>`).join('\n')
  await writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
} else {
  await writeFile(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n')
}

console.log(
  `[prerender] ${written.length} routes written (${catalog?.products.length ?? 0} product pages${token ? '' : '; no Tebex token set'})` +
    `${siteUrl ? `, sitemap for ${siteUrl}` : ''}.`,
)
