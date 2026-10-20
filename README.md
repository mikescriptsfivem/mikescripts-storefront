# MikeScripts Storefront

A custom storefront for **MikeScripts** FiveM scripts. Products, prices and categories load live from your Tebex store through the official [Tebex Headless API](https://docs.tebex.io/developers/headless-api), and every purchase is paid on Tebex’s own checkout. The site is static, so it runs free on GitHub Pages.

- React 19 + TypeScript + Vite 7 + Tailwind CSS 4, React Router 7
- No backend and no private keys: only your Tebex **public** token is used
- Works at a domain root or under a GitHub Pages repository path (`https://you.github.io/repo/`)

---

## Contents

1. [What you need to supply](#1-what-you-need-to-supply)
2. [Run it on your computer](#2-run-it-on-your-computer)
3. [Connect Tebex](#3-connect-tebex)
4. [Deploy to GitHub Pages](#4-deploy-to-github-pages)
5. [Edit the content](#5-edit-the-content)
6. [How buying works](#6-how-buying-works)
7. [Commands](#7-commands)
8. [Project structure](#8-project-structure)
9. [Security](#9-security)
10. [Troubleshooting](#10-troubleshooting)

More detail: [docs/TEBEX-INTEGRATION.md](docs/TEBEX-INTEGRATION.md) · [docs/ASSETS.md](docs/ASSETS.md) · [docs/BACKEND.md](docs/BACKEND.md)

---

## 1. What you need to supply

| Value | Where it goes | Required? |
| --- | --- | --- |
| **Tebex public token** | `VITE_TEBEX_PUBLIC_TOKEN` (`.env.local` locally, a GitHub repository *variable* for deployment) | **Yes.** Already in `.env.local` on this computer; add it as a GitHub variable when you deploy (section 4). Without it the site shows a “catalogue not connected” notice. |
| Discord invite URL | `links.discord` in `src/config/site.ts` | Set to `https://discord.gg/nEzMzNUqnr` (the permanent MikeScripts invite from your MS_Fire listing). Set it to `''` to hide Discord buttons. |
| Your own refund policy URL | `links.refundPolicy` in `src/config/site.ts` | Optional. Otherwise the FAQ points to Tebex’s checkout terms. |
| Genuine customer reviews | `reviews` in `src/config/site.ts` | Optional. The reviews section stays hidden while the list is empty. |

Everything else (branding, artwork, product details, installation guides) is already filled in from your own files. See [docs/ASSETS.md](docs/ASSETS.md).

## 2. Run it on your computer

1. Install [Node.js](https://nodejs.org) 22 LTS (20.19 or newer also works).
2. In this folder:

   ```bash
   npm install
   cp .env.example .env.local     # Windows PowerShell: Copy-Item .env.example .env.local
   ```

3. Open `.env.local` and paste your public token after `VITE_TEBEX_PUBLIC_TOKEN=` (see the next section).
4. Start the dev server and open http://localhost:5173:

   ```bash
   npm run dev
   ```

The page reloads as you edit files. Restart `npm run dev` after changing `.env.local`.

## 3. Connect Tebex

1. Go to **[creator.tebex.io → Developers → API Keys](https://creator.tebex.io/developers/api-keys)**.
2. Copy the **Public Token**. It starts with a short prefix and a dash, for example `abcd-0123456789abcdef…`.
3. Paste it into `.env.local` (local) and into the GitHub variable (deployment, step 4).

> ⚠️ **Never use the Private Key.** The public token is designed to be visible in the browser. The private key gives full access to your account. The build refuses to run if a `VITE_` variable name contains `PRIVATE`, `SECRET`, `PASSWORD` or `WEBHOOK`, and it rejects a token that doesn’t look like a public token.

Check the connection with:

```bash
npm run tebex:packages
```

It prints every package with its `ident`, which you can use to pin products in `src/config/products.ts` (section 5).

**Testing purchases:** Tebex has no sandbox. Turn on **Settings → Checkout → Test Mode** in the Tebex panel to get a “Test Payments” method, buy something, then **remove test payments and turn Test Mode off** before going public ([Tebex docs](https://docs.tebex.io/developers/headless-api/testing)).

## 4. Deploy to GitHub Pages

1. Create a repository on GitHub (for example `mikescripts-storefront`) and push this folder:

   ```bash
   git init
   git add .
   git commit -m "MikeScripts storefront"
   git branch -M main
   git remote add origin https://github.com/<you>/mikescripts-storefront.git
   git push -u origin main
   ```

2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → Variables tab → New repository variable**
   - Name: `TEBEX_PUBLIC_TOKEN`
   - Value: your public token
   (A *variable* is the right place because the token is public. Never add the private key anywhere.)
4. Open the **Actions** tab and run **Deploy to GitHub Pages** (or push any commit). When it finishes, the site is live at `https://<you>.github.io/<repository>/`.

The workflow (`.github/workflows/deploy.yml`) type-checks, lints, tests, builds with the correct base path and deploys. It also rebuilds once a day so new products get share previews; delete the `schedule` block if you don’t want that. Prices are always fetched live, so they are never stale.

### Custom domain (optional)

1. **Settings → Pages → Custom domain**: enter e.g. `store.mikescripts.com` and save.
2. At your DNS provider add a `CNAME` record: `store` → `<you>.github.io`. For an apex domain (`mikescripts.com`) use GitHub’s `A` records listed in [GitHub’s docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
3. Tick **Enforce HTTPS** once the certificate is ready, then re-run the workflow. The base path switches to `/` automatically.

## 5. Edit the content

You never need to touch components for day-to-day changes. Everything lives in `src/config` and `src/content`:

| File | What it controls |
| --- | --- |
| `src/config/site.ts` | Links (Discord, store, docs, refund policy), FiveM server bar, recent-customer pop-up, hero text and image, featured products, featured release, storefront categories, About text, reviews, FAQ |
| `src/config/products.ts` | Extra product content Tebex doesn’t store: galleries, features, requirements, frameworks, changelog, docs links |
| `src/config/media.ts` | Image manifest (all local artwork, by id) |
| `src/config/showcase.ts` | Showcase page galleries |
| `src/content/docs.ts` | Installation guides at `/docs` |
| `src/styles/index.css` | Colours and fonts (design tokens at the top) |

**Tebex is the source of truth.** Names, prices, categories, descriptions and package images come from Tebex. Change them in the Tebex panel and the site follows. Never put prices in these files.

### Adding a new product

Just create the package in Tebex. It appears in the catalogue, its category and search automatically. Optionally:

1. Add an entry to `src/config/products.ts` with a gallery, features or requirements.
2. Pin it to the exact package with `tebex: { ident: 'pkg_…' }` (get the ident from `npm run tebex:packages`). Until it is pinned, the `match.name` pattern is used.
3. To feature it on the homepage, add its `key` to `featuredProducts` or set it as `featuredRelease` in `site.ts`.

### Replacing or adding images

Images are referenced by id in `src/config/media.ts`. To replace one, overwrite the files in `public/media/` with the same names (`<id>-800.webp`, `<id>-1600.webp`, …), or point the entry at a single new file:

```ts
'ms8000/studio-hero': { alt: 'MS8000 in the hangar', file: 'media/custom/ms8000-hero.jpg', width: 2560, height: 1440 },
```

Use 16:9 images at least 1600 px wide, exported as WebP or high-quality JPEG. Details in [docs/ASSETS.md](docs/ASSETS.md).

### Categories

Your Tebex store has one category (“Packages”), so the storefront groups products itself with `categories` in `src/config/site.ts` (Aviation, Police, Fire & Rescue, Vehicle Systems, Subscription). New products you don’t list there appear under “Other scripts”. If you create real categories in the Tebex panel instead, set `categories: []` and the site uses the Tebex ones.

### Product descriptions

Descriptions come straight from Tebex. Several of yours contain Markdown typed into the editor (`## Heading`, `- item`, `**bold**`, `| table |`); the storefront turns that into proper headings, lists, bold text and tables, and joins hard-wrapped lines back into sentences. Things worth fixing in the Tebex panel itself:

- **MS Flight - Air Traffic Control Tower:** the text still contains the placeholder “Support on Discord: [DISCORD LINK]”.
- **MS_HwyWrk:** the Discord link text reads “[ Discord link]”.
- Your listings use three different Discord invites (`nEzMzNUqnr`, `4FSwRc4v3S`, `bBbZk5HzPK`). All three are permanent and go to the MikeScripts server, so nothing is broken, but one invite everywhere is tidier.

### FiveM server bar and recent customers

- **Server bar:** `fivemServer` in `site.ts` shows `connect <address>` at the top of every page with **Copy** and **Connect** (launches FiveM) buttons. Add your `cfx.re/join/…` link as `joinUrl` if you have one; set `address: ''` to hide the bar.
- **Recent customers:** `recentCustomers` shows real recent buyers (Cfx.re name and avatar) from the **Recent Payments** module in Tebex → Webstore → Sidebar, a few per visit. Tebex shares no product or time there, so none is shown. Set `enabled: false` to turn it off.

### When a visitor's browser can't reach Tebex

Some setups block `headless.tebex.io` (VPNs, Edge “Strict” tracking prevention, security software). Every build saves the live catalogue as `catalog-snapshot.json`, so those visitors still see every product with a notice, and **Buy on Tebex** opens the product on your official store. The site switches back to live data as soon as Tebex is reachable.

### Custom pages from Tebex

Pages you create in Tebex under **Webstore → Pages** (for example terms or a refund policy) appear automatically in the footer and render at `/pages/<slug>`. Your existing **About** page already shows there.

## 6. How buying works

```
Add to basket ─► basket created on Tebex ─► customer logs in with Cfx.re (Tebex redirect)
      ─► back on the same page, script added by its Tebex ident ─► basket drawer
      ─► "Checkout with Tebex" ─► genuine Tebex checkout (pay.tebex.io) ─► back to /checkout/complete
```

- Tebex requires the customer to log in before anything can be added (verified against the live API). A purchase started before login is saved and resumed automatically when the customer returns.
- The site only redirects to `https://*.tebex.io` checkout URLs returned by Tebex. Card details are never entered on this site.
- `/checkout/complete` only says “payment confirmed” when Tebex reports the basket as complete.
- Scripts are single licences, so a script already in the basket can’t be added twice. Buttons are locked while a basket request is running.
- Packages that need customer input at purchase time (Tebex “variables”) show **Buy on Tebex** and open the package on mikescripts.tebex.io.
- Expired baskets are detected and replaced; network failures show a clear message with a retry.

## 7. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-check, production build into `dist/`, then prerender routes |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check + lint + unit tests (what CI runs) |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run tebex:packages` | List your Tebex packages and their idents |

## 8. Project structure

```
.github/workflows/deploy.yml   GitHub Pages deployment
public/brand/                  Logo, favicons, share image
public/media/                  Product artwork (WebP, responsive sizes)
scripts/prerender-routes.mjs   Post-build: per-page HTML, product share previews, 404 fallback, sitemap
scripts/tebex-packages.mjs     Lists your packages and idents
src/config/                    Everything you edit day to day (see section 5)
src/content/docs.ts            Installation guides
src/lib/tebex/                 Tebex Headless API client (public endpoints only)
src/lib/basket-flow.ts         Basket workflow (create → login → add → checkout)
src/lib/catalog.ts             Merges Tebex data with local content; search, filters, sorting
src/state/                     Catalogue and basket state (React context)
src/components/, src/pages/    UI
```

## 9. Security

- Only the public token is used, and only for public Headless API endpoints. Nothing in this project needs or accepts the private key.
- `.env.local` is git-ignored. The build blocks `VITE_` variables that look like secrets and rejects malformed tokens.
- Tebex HTML (descriptions, custom pages) is sanitised with DOMPurify. Scripts, forms and inline styles are removed, and iframes are only allowed from YouTube, Vimeo, Streamable and Medal.
- Checkout redirects are restricted to HTTPS `tebex.io` URLs.
- Anything that needs the private key (webhooks, Discord role sync, order lookups) must run on a server. See [docs/BACKEND.md](docs/BACKEND.md).

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| “The live catalogue is not connected yet” | `VITE_TEBEX_PUBLIC_TOKEN` is empty. Set it in `.env.local` and restart `npm run dev`, or add the `TEBEX_PUBLIC_TOKEN` variable on GitHub and re-run the workflow. |
| “Account not found” | The token is wrong. Copy the **Public Token** again from creator.tebex.io. |
| Build error mentioning the token | It doesn’t look like a public token. Make sure you didn’t paste the private key. |
| Blank page or missing styles on GitHub Pages | Pages source must be **GitHub Actions**, not “Deploy from a branch”. |
| A product shows the wrong extra content | Its `match.name` pattern caught another package. Pin it with `tebex: { ident: '…' }`. |
| Login says no option is available | Tebex returned no login method for the basket. Check that the store is a FiveM store and try again. |
| Setting `VITE_BASE_PATH` in Git Bash produces `C:/Program Files/Git/...` | Git Bash rewrites paths. Put it in `.env.local` instead, or prefix the command with `MSYS_NO_PATHCONV=1`. |

---

MikeScripts is not affiliated with or endorsed by Rockstar Games, Take-Two Interactive or Cfx.re. Tebex Limited is the reseller and merchant of record for purchases.
