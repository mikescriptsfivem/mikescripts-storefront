# Optional backend (not required)

The storefront needs **no backend**: browsing, baskets, login and checkout all use public Headless API endpoints that Tebex designed for browsers.

Some features would need your Tebex **private key** or a webhook secret. Those must never be put in this repository or in any `VITE_` variable, because everything in the frontend bundle is public. If you want any of them, run a small server-side function next to the static site.

| Feature | Why it needs a server |
| --- | --- |
| Reacting to purchases (Discord roles, notifications, logging) | Tebex webhooks are signed with a secret that must be verified server-side |
| Looking up a customer’s past orders or licences | Uses the private Plugin/Checkout APIs |
| Creating custom checkout baskets server-side (e.g. dynamic pricing) | Requires authenticated APIs and the customer’s IP |

## Recommended shape

```
GitHub Pages (this site, public token only)
        │  HTTPS
        ▼
Serverless function (Cloudflare Workers, Vercel or Netlify Functions)
  - holds TEBEX_PRIVATE_KEY / TEBEX_WEBHOOK_SECRET as encrypted environment secrets
  - POST /tebex/webhook  → verify the X-Signature header, then act (e.g. call your Discord bot)
        │
        ▼
Tebex APIs (private key never leaves the server)
```

Guidelines:

- Store secrets only in the hosting provider’s encrypted secret settings, never in Git.
- Verify every webhook signature before trusting it, and respond quickly (do slow work asynchronously).
- Allow only the storefront origin in CORS for any endpoint the browser calls.
- Rotate the private key at creator.tebex.io → Developers → API Keys if it is ever exposed.
