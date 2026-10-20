import type { MediaId } from './media'

/**
 * Optional local content for products, merged with the live Tebex data.
 *
 * Tebex stays the source of truth for names, prices, images and descriptions. Use this file only for extras:
 * a clean URL slug, galleries, requirements, compatibility labels, documentation links and changelogs.
 * Never put prices here.
 *
 * Linking an entry to a Tebex package:
 *  1. Recommended: pin it with the package's real identifier, e.g. `tebex: { ident: 'pkg_1234_5678' }`.
 *     Run `npm run tebex:packages` to list every package ident in your store.
 *  2. Otherwise `match.name` (a case-insensitive pattern) is tested against the Tebex package name and the first
 *     matching package in catalogue order wins; `match.exclude` skips names such as bundles.
 *     In patterns `_` counts as a letter, so use (?<![a-z0-9]) and (?![a-z0-9]) around names instead of \b.
 * An entry that matches nothing is ignored. Products without an entry still display normally.
 */
/** A resource delivered as part of another package (shown in an "Included in this package" section). */
export interface IncludedItem {
  title: string
  summary: string
  image?: MediaId
  highlights?: string[]
  /** Id of a guide in src/content/docs.ts. */
  docsGuide?: string
  /** Id of a gallery in src/config/showcase.ts. */
  showcase?: string
}

export interface ProductContent {
  /** Local handle used by site.ts (featured products, categories, featured release, showcase). */
  key: string
  tebex?: { ident?: string; id?: number; slug?: string }
  match?: { name: RegExp; exclude?: RegExp }
  /** URL segment, e.g. 'ms8000' → /scripts/ms8000. Keeps links stable when the Tebex name changes. */
  slug?: string
  /** Display name for cards and headings. Defaults to the Tebex name without tags like "[ESX, QBOX]" or "| …". */
  shortName?: string
  /** One-line pitch shown under the product name. */
  tagline?: string
  /** Short card description. Defaults to the first paragraph of the Tebex description. */
  summary?: string
  /** Artwork used on banners. Defaults to the Tebex package image. */
  heroImage?: MediaId
  /** Extra screenshots shown after the Tebex images. */
  gallery?: MediaId[]
  /** YouTube video id. A video in the Tebex package media is used automatically. */
  video?: { youtubeId: string; title: string }
  /** Short bullets for the featured release section. */
  highlights?: string[]
  features?: { title: string; items: string[] }[]
  requirements?: { required: string[]; optional?: string[] }
  frameworks?: string[]
  /** Compact compatibility labels. */
  compatibility?: string[]
  /** Id of a guide in src/content/docs.ts. */
  docsGuide?: string
  /** External documentation URL. */
  documentationUrl?: string
  changelog?: { version: string; date?: string; notes: string[] }[]
  /** Other resources delivered with this package. */
  includes?: IncludedItem[]
}

export const productContent: ProductContent[] = [
  // ------------------------------------------------------------------ Live on Tebex (pinned by ident)
  // Details below are taken from each package's live Tebex description.
  {
    key: 'ms-flightsim',
    tebex: { ident: 'pkg_3248219_7324328' },
    slug: 'ms-flightsim',
    tagline: 'Turn flying into a full roleplay career. One drop-in resource, zero glue scripts.',
    requirements: {
      required: ['oxmysql', 'ox_lib', 'ox_inventory', 'One of: qbx_core, qb-core or es_extended', 'OneSync (for the included MS-100 and MS-E fleet)'],
      optional: ['ox_target', 'PolyZone', 'qbx_vehiclekeys or qb-vehiclekeys', 'Game build 2699 or newer (MS-E electric drive sound)'],
    },
    frameworks: ['ESX Legacy', 'QBox', 'QBCore'],
    compatibility: ['ESX Legacy · QBox · QBCore', 'Includes MS-100 + MS-E fleet', 'English & French', 'Editable config and bridge'],
    docsGuide: 'ms-flightsim',
    includes: [
      {
        title: 'MS-100 walk-in airliner',
        summary: 'A walk-in airliner with 16 passenger seats, pilot and co-pilot seats, ten working doors and five liveries.',
        image: 'ms100/front34',
        highlights: [
          'Walk into the parked cabin and take a numbered seat, or the pilot and co-pilot seats',
          'Doors l1, r1, l2, r2, cargo, aft cargo and four emergency exits',
          'Landing gear, landing lights (off, low, high), nav, beacon and cabin lights',
          'MS-E service vehicles dock to the matching doors (/ms100align)',
        ],
        docsGuide: 'ms100',
        showcase: 'ms100',
      },
      {
        title: 'MS-E ground support fleet',
        summary: 'Eleven airport service units in one resource, with working lifts, stairs, conveyors and doors.',
        image: 'mse/lineup-front34',
        highlights: [
          'TG-30 tug, BL-40 belt loader, GP-90 GPU, HD-18 fuel and PW-15 potable water',
          'LS-12 lavatory service, CT-70 catering hi-lift and PS-50 passenger stairs',
          'BC-25 baggage cart, PD-20 pallet dolly and TB-20 towbar, coupled to the TG-30 tug',
          'Detects QBox, QBCore or ESX automatically for fuel and vehicle keys',
        ],
        docsGuide: 'mse-fleet',
        showcase: 'mse',
      },
    ],
  },
  {
    key: 'ms8000',
    tebex: { ident: 'pkg_3248219_7696768' },
    slug: 'ms8000',
    tagline: 'A full-size private jet you can actually walk through, even in the air.',
    summary:
      'Ultra-long-range luxury business jet with a fully walkable cabin, six luxury liveries and a printed glass cockpit. Standalone.',
    heroImage: 'ms8000/studio-hero',
    gallery: [
      'ms8000/studio-hero',
      'ms8000/night-ramp',
      'ms8000/airstair-door',
      'ms8000/cabin-overview',
      'ms8000/club',
      'ms8000/conference',
      'ms8000/entertainment-lounge',
      'ms8000/lounge-evening',
      'ms8000/master-suite',
      'ms8000/suite-night',
      'ms8000/galley',
      'ms8000/flight-deck',
      'ms8000/captain-view',
      'ms8000/six-liveries',
    ],
    highlights: [
      'Club, conference and dining, entertainment lounge and a private master suite',
      'Sit anywhere with F: crew seats, club chairs, a divan, a lounge chair and the suite bed',
      'Animated airstair door, baggage door, emergency hatch and gear doors',
      'Six luxury full-body liveries with high-detail paint and panel lines',
      'Eight cabin lighting modes with a starlight headliner',
      'Landing lights follow MS_FlightSim’s light switches when it runs',
    ],
    features: [
      {
        title: 'Exterior',
        items: [
          '34 m long, 31.7 m wingspan and 8.2 m tall, built to real business-jet proportions',
          'Four-pane wraparound windshield, drooped nose and blended winglets',
          'Board on foot: press E at the main door (or use ox_target) and walk up the airstair',
          'Nav, strobe, beacon, logo and inspection lights; H cycles taxi and landing beams',
          '6 liveries: Midnight Sapphire, Onyx & Gold, Emerald, Bordeaux, Champagne and Graphite & Platinum',
        ],
      },
      {
        title: 'Walkable cabin',
        items: [
          'Club, conference and dining, entertainment lounge and master suite, plus galley, lavatory and baggage',
          'Sit anywhere with F: 2 crew seats, 8 club and conference chairs, a lounge chair, a 3-seat divan and the suite bed',
          'Cabin lighting modes: boarding, cruise, dining, lounge, night, sleep, full and auto',
          'Fully closed cabin: the only way off is the main door',
        ],
      },
      {
        title: 'Cockpit and integrations',
        items: [
          'Detailed flight deck with yokes, pedestal, overhead panel and printed glass-cockpit displays',
          'Optional MS_FlightSim support: landing lights follow its cockpit light switches',
          'Built-in service points for the MikeScripts MS-E ground fleet',
        ],
      },
      {
        title: 'Performance',
        items: [
          '4 airframe LODs, from 139k triangles close up to 5k beyond 400 m',
          'The walk-in interior streams only within 70 m and switches to a light version beyond 35 m',
          'Every streamed file stays under FiveM’s 16 MB limit; textures are compressed with full mipmaps',
          'Low idle cost: nothing runs every frame unless you are on board or its lights are on',
        ],
      },
    ],
    requirements: {
      required: ['ms_aircraft_core (included with your purchase)'],
      optional: ['ox_target (open and close the doors from the target menu)', 'MS_FlightSim (landing light sync)'],
    },
    frameworks: ['Standalone (no framework required)'],
    compatibility: ['Standalone', 'ms_aircraft_core included', 'Open config.lua', 'Cfx Asset Escrow'],
    docsGuide: 'ms8000',
  },
  {
    key: 'ms-hwywrk',
    tebex: { ident: 'pkg_3248219_7692812' },
    slug: 'ms-hwywrk',
    shortName: 'MS_HwyWrk Heavy Rotator Wrecker',
    tagline: 'A heavy rotator tow truck with working boom, winches, wheel-lift and scene lighting.',
    requirements: {
      required: ['FiveM server with OneSync'],
      optional: ['ESX, QBCore or Qbox (only for job permissions)'],
    },
    frameworks: ['Standalone', 'ESX, QBCore or Qbox for job permissions'],
    compatibility: ['No framework required', 'OneSync', 'English & French', 'Open config.lua'],
    docsGuide: 'ms-hwywrk',
  },
  {
    key: 'ms-helipol',
    tebex: { ident: 'pkg_3248219_7426329' },
    slug: 'ms-helipol',
    tagline: 'Police air support: stabilised camera, target lock, synced spotlight and rappel.',
    requirements: {
      required: [],
      optional: ['ox_lib (notifications and keymaps)', 'OneSync Infinity (recommended for spotlight broadcast)'],
    },
    frameworks: ['ESX Legacy 1.10+', 'QBCore', 'Qbox', 'Standalone (ace permission)'],
    compatibility: ['ESX · QBCore · Qbox · Standalone', 'Rebindable keys', 'Free lifetime updates'],
    docsGuide: 'ms-helipol',
  },
  {
    key: 'ms-fire',
    tebex: { ident: 'pkg_3248219_7437723' },
    slug: 'ms-fire',
    tagline: 'Fire alarm panels, synced strobes, sprinklers and firefighter inspections.',
    requirements: {
      required: ['oxmysql', 'ox_target', 'One of: es_extended, qb-core or qbx_core'],
      optional: ['ox_inventory (recommended)'],
    },
    frameworks: ['ESX Legacy', 'QBCore', 'Qbox'],
    compatibility: ['ESX · QBCore · Qbox', 'English & French', 'Open config, bridge and NUI'],
    docsGuide: 'ms-fire',
  },
  {
    key: 'ms-atc-tower',
    tebex: { ident: 'pkg_3248219_7729073' },
    slug: 'ms-atc-tower',
    tagline: 'A walk-in air traffic control tower for Los Santos International.',
    requirements: { required: ['No dependencies (base-game props)'] },
    compatibility: ['MLO · 3 rooms', '2.9 MB streamed', 'Open config.lua'],
    docsGuide: 'ms-atc-tower',
  },
  {
    key: 'ms-balloon',
    tebex: { ident: 'pkg_3248219_7703463' },
    slug: 'ms-balloon',
    shortName: 'Hot Air Balloon',
    tagline: 'A free, fully usable hot air balloon for FiveM.',
    frameworks: ['Standalone'],
    docsGuide: 'ms-balloon',
  },
  {
    key: 'subscription',
    tebex: { ident: 'pkg_3248219_7472845' },
    slug: 'all-scripts-subscription',
  },
]
