import type { MediaId } from './media'

/**
 * Showcase page galleries. Images come from src/config/media.ts.
 * `productKey` (from src/config/products.ts) adds a "View script" link once that product is live on Tebex.
 * `includedWith` marks content delivered inside another package (product key); the gallery links to that package.
 * `onlyWhenLive` hides the gallery until its product is live (for releases that are not on the store yet).
 * Live products without a gallery here are shown automatically with their Tebex images.
 */
export interface ShowcaseGroup {
  id: string
  title: string
  subtitle: string
  productKey?: string
  includedWith?: string
  onlyWhenLive?: boolean
  images: MediaId[]
}

export const showcase: ShowcaseGroup[] = [
  {
    id: 'ms8000',
    title: 'MS8000',
    subtitle: 'Ultra-long-range luxury business jet with a fully walkable cabin.',
    productKey: 'ms8000',
    images: [
      'ms8000/studio-hero',
      'ms8000/night-ramp',
      'ms8000/studio-rear',
      'ms8000/studio-top',
      'ms8000/nose-windshield',
      'ms8000/airstair-door',
      'ms8000/engine',
      'ms8000/tail',
      'ms8000/night-boarding',
      'ms8000/cabin-overview',
      'ms8000/club',
      'ms8000/conference',
      'ms8000/entertainment-lounge',
      'ms8000/lounge-evening',
      'ms8000/master-suite',
      'ms8000/suite-night',
      'ms8000/galley',
      'ms8000/entry',
      'ms8000/flight-deck',
      'ms8000/captain-view',
      'ms8000/six-liveries',
    ],
  },
  {
    id: 'ms100',
    title: 'MS-100',
    subtitle: 'Walk-in airliner with working doors, cabin seating and MS-E docking. Included with All-In-One Flight Simulator.',
    includedWith: 'ms-flightsim',
    images: [
      'ms100/apron-aerial',
      'ms100/front34',
      'ms100/apron-front-left',
      'ms100/apron-front-right',
      'ms100/apron-nose-low',
      'ms100/side',
      'ms100/rear34',
      'ms100/front',
      'ms100/rear-high',
      'ms100/cabin',
    ],
  },
  {
    id: 'mse',
    title: 'MS-E Ground Support Fleet',
    subtitle: 'Eleven airport service units in one resource. Included with All-In-One Flight Simulator.',
    includedWith: 'ms-flightsim',
    images: [
      'mse/lineup-apron',
      'mse/lineup-front34',
      'mse/lineup-front',
      'mse/tg30',
      'mse/bl40',
      'mse/gp90',
      'mse/hd18',
      'mse/pw15',
      'mse/ls12',
      'mse/ct70',
      'mse/ps50',
      'mse/bc25',
      'mse/pd20',
      'mse/tb20',
    ],
  },
]
