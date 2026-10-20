# Tebex integration

Technical reference for how the storefront talks to Tebex. Sources: the [Tebex Headless API docs](https://docs.tebex.io/developers/headless-api) and the official OpenAPI schema ([tebexio/TebexHeadless-OpenAPI](https://github.com/tebexio/TebexHeadless-OpenAPI)), checked against the live API in October 2026.

## Endpoints used

All requests go straight from the browser to `https://headless.tebex.io` (Tebex allows this: `Access-Control-Allow-Origin: *`). Only the **public token** is used.

| Purpose | Request | Code |
| --- | --- | --- |
| Store info | `GET /api/accounts/{token}` | `getWebstore` |
| Categories with packages | `GET /api/accounts/{token}/categories?includePackages=1` | `getCategoriesWithPackages` |
| Custom pages | `GET /api/accounts/{token}/pages` | `getPages` |
| Create basket | `POST /api/accounts/{token}/baskets` `{ complete_url, cancel_url, complete_auto_redirect }` | `createBasket` |
| Read basket | `GET /api/accounts/{token}/baskets/{basketIdent}` | `getBasket` |
| Login links | `GET /api/accounts/{token}/baskets/{basketIdent}/auth?returnUrl=…` | `getBasketAuthMethods` |
| Add package | `POST /api/baskets/{basketIdent}/packages` `{ package_id: <ident>, quantity: 1 }` | `addPackage` |
| Remove package | `POST /api/baskets/{basketIdent}/packages/remove` `{ package_id }` | `removePackage` |

Package add/remove use the basket-only server (`/api/baskets`), exactly as the OpenAPI schema specifies. Packages are always referenced by their `ident` (e.g. `pkg_12_456`), which Tebex recommends over numeric ids.

The client lives in `src/lib/tebex/` and the workflow in `src/lib/basket-flow.ts`.

## Purchase workflow

1. **Basket.** On the first purchase action a basket is created. Its `ident` is kept in `localStorage` (`mikescripts.basket`) and re-read from Tebex on every visit.
2. **Login.** Tebex rejects adding packages to a basket that isn’t logged in (`422 "User must login before adding packages to basket"`, confirmed on the live API). The site asks `/auth` for login links and redirects the customer (FiveM stores log in with Cfx.re). The pending action is saved first (`mikescripts.pendingAdd`, valid for 30 minutes).
3. **Return.** Tebex sends the customer back to the same page with `?tebex_auth=1`. The app removes the marker, re-reads the basket (now with a `username`) and finishes the pending add.
4. **Add.** `POST /packages` with the package ident. A script already in the basket isn’t added again (Tebex would raise the quantity).
5. **Checkout.** The basket is re-read and the customer is sent to `links.checkout`, only if it is an HTTPS `tebex.io` URL (it looks like `https://pay.tebex.io/<basketIdent>`).
6. **Complete.** Tebex returns the customer to `/checkout/complete`. The page shows success only if Tebex reports `complete: true` for the basket, then clears it locally.

### Error handling

| Situation | Behaviour |
| --- | --- |
| No token configured | Catalogue areas show a “not connected” notice with a link to mikescripts.tebex.io; no basket UI |
| Network failure / timeout (15 s) | Clear message with **Try again**; the basket is not discarded |
| Tebex 4xx/5xx | The RFC 9457 `detail` (or `title`) from Tebex is shown |
| Basket expired (`404`) | Basket forgotten; a new one is created on the next action |
| Basket already paid | Shown on `/checkout/complete`, then cleared |
| Login abandoned | The pending add is dropped with a message; nothing is added silently |
| Double clicks | One basket operation at a time; buttons are disabled while it runs |
| Package needs customer input (`variables`) | **Buy on Tebex** link to `https://mikescripts.tebex.io/package/<id>` |
| Back button after leaving for Tebex | The page is restored with buttons enabled |

## What was verified

| Check | How | Result |
| --- | --- | --- |
| Endpoint paths, payloads, headers, description rendering | Unit tests (`src/lib/**/*.test.ts`) | 68 passing tests |
| Live MikeScripts catalogue | Real API with your public token | 8 packages, prices, images, media and the About page load in the browser |
| Live login method | A real (empty) basket on your store, then `/auth` | One method, **FiveM**, pointing to `ident.tebex.io/fivem` with a signed return URL |
| Live “login first” rule | Adding to that basket without login | `422 User must login before adding packages to basket`, which the site handles by logging in first |
| Full purchase flow on your real catalogue | Production build in Chromium; the basket and Cfx.re login were simulated (the test can’t log into a Cfx.re account) | Login redirect, resume, drawer, checkout redirect to `pay.tebex.io/<basket>`, Buy now, double clicks, outage + retry all passed |
| CORS and real error responses | Real API (Tebex demo store; a non-existent token) | Browser `POST /baskets` returned 200; “Account not found” shown with retry |
| GitHub Pages subpath | Build served under `/mikescripts-storefront/` by a server that mimics GitHub Pages | All routes 200, product pages prerendered, deep links fall back to `404.html` |

**Still to do by hand:** one real end-to-end purchase. With Tebex **Test Mode** on, log in with your Cfx.re account on the deployed site, add a script, pay with “Test Payments” and confirm you land back on `/checkout/complete`. Then remove test payments and turn Test Mode off. No live payment has been made.

## Why there is no backend

Every endpoint above is public and designed for browser use, so GitHub Pages is enough. Features that need the private key (webhooks, order lookups, Discord role sync) are described in [BACKEND.md](BACKEND.md).
