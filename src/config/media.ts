/**
 * Image manifest. Components refer to images by id, never by file path, so artwork can be replaced
 * here (or by overwriting the files in /public/media) without touching any component.
 *
 * Two ways to describe an image:
 *  - `widths`: responsive WebP variants stored as `public/media/<id>-<width>.webp`
 *    (e.g. id "ms8000/engine" with widths [800, 1600] → ms8000/engine-800.webp and ms8000/engine-1600.webp).
 *  - `file`: a single image path relative to /public, e.g. "media/custom/new-banner.jpg".
 * `width`/`height` are the original pixel dimensions (used for layout and aspect ratio).
 *
 * See docs/ASSETS.md for where every image came from and how to add new ones.
 */
export interface MediaAsset {
  alt: string
  widths?: readonly number[]
  file?: string
  width: number
  height: number
}

const GALLERY = [800, 1600] as const
const HERO = [800, 1600, 2400] as const
const render = (alt: string, widths: readonly number[] = GALLERY): MediaAsset => ({ alt, widths, width: 2560, height: 1440 })

export const media = {
  // Homepage hero. A wrecker still — not an aircraft.
  'hero/wrecker': {
    alt: 'HwyWrk heavy rotator wrecker on a night highway',
    file: 'media/hero/wrecker.jpg',
    width: 2560,
    height: 1440,
  },

  // MS8000 (MikeScripts release gallery)
  'ms8000/studio-hero': render('MS8000 business jet in a dark studio, white and gold livery', HERO),
  'ms8000/studio-rear': render('MS8000 from the rear quarter in the Midnight Sapphire livery'),
  'ms8000/studio-profile': render('MS8000 side profile in the Bordeaux livery'),
  'ms8000/studio-front': render('MS8000 head-on view showing the winglets and landing gear'),
  'ms8000/studio-top': render('MS8000 from above in the Onyx and Gold livery'),
  'ms8000/nose-windshield': render('Close-up of the MS8000 nose and four-pane wraparound windshield'),
  'ms8000/airstair-door': render('MS8000 main door open with its built-in airstair'),
  'ms8000/engine': render('Close-up of an MS8000 engine nacelle'),
  'ms8000/tail': render('MS8000 tail fin and engines'),
  'ms8000/night-ramp': render('MS8000 parked on a floodlit ramp at night with the airstair down', HERO),
  'ms8000/night-boarding': render('MS8000 boarding door and airstair at night'),
  'ms8000/cabin-overview': render('MS8000 cabin looking aft from the entry'),
  'ms8000/club': render('MS8000 club section with four leather chairs and tables'),
  'ms8000/conference': render('MS8000 conference and dining section'),
  'ms8000/entertainment-lounge': render('MS8000 entertainment lounge with three-seat divan'),
  'ms8000/lounge-evening': render('MS8000 lounge in evening lighting mode'),
  'ms8000/master-suite': render('MS8000 master suite with double bed'),
  'ms8000/suite-night': render('MS8000 master suite in night lighting mode'),
  'ms8000/galley': render('MS8000 galley with stone counters and cabinetry'),
  'ms8000/entry': render('MS8000 entry area and illuminated wall'),
  'ms8000/flight-deck': render('MS8000 flight deck with yokes and glass cockpit displays'),
  'ms8000/captain-view': render('View from the MS8000 captain seat'),
  'ms8000/six-liveries': render('The six MS8000 luxury liveries side by side'),

  // MS-100 (store renders)
  'ms100/front34': render('MS-100 airliner front three-quarter view in the MikeScripts livery'),
  'ms100/rear34': render('MS-100 airliner rear three-quarter view'),
  'ms100/side': render('MS-100 airliner side profile'),
  'ms100/front': render('MS-100 airliner head-on view'),
  'ms100/rear-high': render('MS-100 airliner seen from above and behind'),
  'ms100/cabin': render('MS-100 passenger cabin with rows of seats'),
  'ms100/apron-aerial': render('MS-100 on the apron surrounded by MS-E ground support vehicles, aerial view', HERO),
  'ms100/apron-front-left': render('MS-100 being serviced by the MS-E fleet, front left view'),
  'ms100/apron-front-right': render('MS-100 being serviced by the MS-E fleet, front right view'),
  'ms100/apron-nose-low': render('MS-100 nose with passenger stairs and service vehicles, low angle'),

  // MS-E ground support fleet (store renders)
  'mse/lineup-apron': render('All eleven MS-E ground support units lined up on an apron', HERO),
  'mse/lineup-front34': render('MS-E ground support fleet lineup, front three-quarter view'),
  'mse/lineup-front': render('MS-E ground support fleet lineup, front view'),
  'mse/tg30': render('MS-E TG-30 aircraft tug'),
  'mse/bl40': render('MS-E BL-40 belt loader'),
  'mse/gp90': render('MS-E GP-90 ground power unit'),
  'mse/hd18': render('MS-E HD-18 fuel truck'),
  'mse/pw15': render('MS-E PW-15 potable water truck'),
  'mse/ls12': render('MS-E LS-12 lavatory service truck'),
  'mse/ct70': render('MS-E CT-70 catering hi-lift'),
  'mse/ps50': render('MS-E PS-50 passenger stairs'),
  'mse/bc25': render('MS-E BC-25 baggage cart'),
  'mse/pd20': render('MS-E PD-20 pallet dolly'),
  'mse/tb20': render('MS-E TB-20 towbar'),
} satisfies Record<string, MediaAsset>

export type MediaId = keyof typeof media

export const brand = {
  logoMark: 'brand/logo-mark.png',
  logoMarkSmall: 'brand/logo-mark-256.png',
  shareImage: 'brand/og-image.jpg',
} as const
