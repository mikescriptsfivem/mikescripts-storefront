import type { StoreCategory } from '../lib/catalog'
import type { MediaId } from './media'

/**
 * Site-wide settings. This is the main file to edit for links, homepage content and FAQ answers.
 * Text fields support [link text](https://example.com) links and `inline code`.
 * Links starting with "/" stay inside the storefront.
 */

export interface SiteLinks {
  store: string
  discord: string
  documentation: string
  refundPolicy: string
  tebexTerms: string
  tebexPrivacy: string
  tebexImpressum: string
  cfxPortal: string
}

/** Leave a link empty ('') to hide every button that would use it. */
const links: SiteLinks = {
  /** Official Tebex store (fallback when the live catalogue cannot load). */
  store: 'https://mikescripts.tebex.io',
  /** Discord invite. Empty ('') hides all Discord buttons. (Permanent invite to the MikeScripts server.) */
  discord: 'https://discord.gg/nEzMzNUqnr',
  /** Optional external documentation site. The built-in /docs pages are always available. */
  documentation: '',
  /** Optional: your own refund policy page. Leave empty to rely on Tebex's checkout terms. */
  refundPolicy: '',
  /** Tebex is the reseller and merchant of record; these are its buyer-facing legal pages. */
  tebexTerms: 'https://checkout.tebex.io/terms',
  tebexPrivacy: 'https://checkout.tebex.io/privacy',
  tebexImpressum: 'https://checkout.tebex.io/impressum',
  cfxPortal: 'https://portal.cfx.re',
}

export interface Review {
  author: string
  text: string
  /** Where the review came from, e.g. "Tebex review" or "Discord". */
  source?: string
  /** Product name the review is about. */
  product?: string
}

export interface FaqItem {
  question: string
  /** Paragraphs. Supports [links](/docs) and `code`. */
  answer: string[]
}

const supportAnswer: string[] = links.discord
  ? [
      `Join the [MikeScripts Discord](${links.discord}) for installation help, bug reports and update announcements.`,
      'Please include your server framework, the script version and any errors from the F8 or server console.',
    ]
  : [
      'Start with the [installation guides](/docs): they cover requirements, server.cfg setup and common commands for each script.',
      `You can also reach MikeScripts through the [official store](${links.store}).`,
    ]

export const site = {
  name: 'MikeScripts',
  description:
    'Premium FiveM scripts and advanced systems, built for immersive gameplay and reliable server experiences.',
  links,

  /**
   * FiveM server shown in the bar at the top of every page. Set `address` to '' to hide the bar.
   * `joinUrl` is optional: paste your cfx.re/join/… link to use it for the Connect button.
   */
  fivemServer: {
    label: 'Play on our FiveM server',
    address: '107.155.80.34:50986',
    joinUrl: '',
  },

  /**
   * Corner pop-up with real recent buyers (Cfx.re name and avatar from the "Recent Payments" sidebar module in
   * Tebex → Webstore → Sidebar). Tebex shares no product or time there, so none is shown. Set enabled: false to turn off.
   */
  recentCustomers: {
    enabled: true,
    /** Buyers shown per visit. */
    max: 3,
    firstDelaySeconds: 10,
    visibleSeconds: 6,
    intervalSeconds: 20,
  },

  hero: {
    eyebrow: 'FiveM scripts & systems',
    headline: 'Engineered for your server.',
    text: 'Premium FiveM scripts and advanced systems, built for immersive gameplay and reliable server experiences.',
    image: 'ms8000/night-ramp' satisfies MediaId as MediaId,
  },

  /**
   * Product keys from src/config/products.ts shown first on the homepage, in order.
   * Keys that do not match a live Tebex package are skipped, and the remaining slots are
   * filled with other live products in Tebex order.
   */
  featuredProducts: ['ms-flightsim', 'ms8000', 'ms-hwywrk', 'ms-helipol', 'ms-fire', 'ms-atc-tower'],
  featuredProductCount: 6,

  /** Product key for the large "featured release" section. Hidden if it is not live on Tebex. */
  featuredRelease: 'ms8000',

  /**
   * Storefront categories. The Tebex store currently has a single "Packages" category, so products are grouped
   * here by product key (from products.ts). Each product appears in the first group that lists it; anything not
   * listed goes under "Other scripts" and empty groups are hidden.
   * To use Tebex categories instead, create them in the Tebex panel and set this to an empty list: [].
   */
  categories: [
    { name: 'Aviation', slug: 'aviation', products: ['ms-flightsim', 'ms8000', 'ms-atc-tower', 'ms-balloon'] },
    { name: 'Police', slug: 'police', products: ['ms-helipol'] },
    { name: 'Fire & Rescue', slug: 'fire-rescue', products: ['ms-fire'] },
    { name: 'Vehicle Systems', slug: 'vehicle-systems', products: ['ms-hwywrk'] },
    { name: 'Subscription', slug: 'subscription', products: ['subscription'] },
  ] satisfies StoreCategory[] as StoreCategory[],

  about: {
    title: 'Built by MikeScripts',
    paragraphs: [
      'MikeScripts develops custom systems and scripts for FiveM servers: full aviation careers and walk-in aircraft, police air support, fire alarm systems and working heavy-recovery vehicles.',
      'Every purchase is processed by Tebex and delivered to your Cfx.re account, so you download your scripts straight from the Cfx.re Portal.',
    ],
    image: 'ms8000/club' satisfies MediaId as MediaId,
    pillars: [
      {
        title: 'Aviation systems',
        text: 'Pilot careers, training, ATC duty and a cockpit suite in MS_FlightSim, with the MS-100 airliner and MS-E ground fleet included.',
        productKey: 'ms-flightsim',
      },
      {
        title: 'Walk-in aircraft and buildings',
        text: 'Walkable spaces like the MS8000 business jet, the MS-100 airliner and the LSIA air traffic control tower.',
        productKey: 'ms8000',
      },
      {
        title: 'Emergency services',
        text: 'Police air support with MS_Helipol and complete fire alarm systems with MS_Fire.',
        productKey: 'ms-helipol',
      },
      {
        title: 'Vehicle systems',
        text: 'Working heavy-recovery equipment in the MS_HwyWrk rotator wrecker.',
        productKey: 'ms-hwywrk',
      },
    ],
  },

  /**
   * Customer reviews. The section stays hidden while this list is empty.
   * Only add genuine reviews you have permission to publish.
   */
  reviews: [] as Review[],

  faq: [
    {
      question: 'How do I purchase a script?',
      answer: [
        'Add a script to your basket. Tebex will ask you to log in with your Cfx.re account first: this is the account the script is delivered to.',
        'Then continue to Tebex’s secure checkout to pay. Payment details are entered on Tebex, never on this website.',
      ],
    },
    {
      question: 'How do I access my purchased scripts?',
      answer: [
        `FiveM resources are granted to the Cfx.re account you logged in with. Sign in to the [Cfx.re Portal](${links.cfxPortal}) and download the script from your granted assets.`,
        'Tebex also emails a receipt for every order.',
      ],
    },
    {
      question: 'How do I install a script, and will it work on my server?',
      answer: [
        'Each script page lists its requirements and supported frameworks. Step-by-step setup for each script is in the [installation guides](/docs).',
        'Escrow-protected resources only start on servers whose license key belongs to the Cfx.re account that owns the script.',
      ],
    },
    {
      question: 'How do updates work?',
      answer: [
        'Updates are published to the same Cfx.re asset, so you can download the latest version from the Cfx.re Portal at any time.',
        'Back up any configuration files you have edited before replacing a resource folder.',
      ],
    },
    {
      question: 'Where can I get support?',
      answer: supportAnswer,
    },
    {
      question: 'What is the refund policy?',
      answer: links.refundPolicy
        ? [
            `Purchases are sold and processed by Tebex Limited, the reseller and merchant of record for this store. See the [MikeScripts refund policy](${links.refundPolicy}) and [Tebex’s checkout terms](${links.tebexTerms}).`,
          ]
        : [
            `Purchases are sold and processed by Tebex Limited, the reseller and merchant of record for this store. Refunds are handled under [Tebex’s checkout terms](${links.tebexTerms}).`,
          ],
    },
  ] satisfies FaqItem[] as FaqItem[],
} as const
