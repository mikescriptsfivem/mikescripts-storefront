# Asset manifest

Every image the site ships, where it came from, and what is still missing. Images are referenced by id in `src/config/media.ts`; components never use file paths directly.

## Brand

| File | Source |
| --- | --- |
| `public/brand/logo-mark.png`, `logo-mark-256.png` | Mike’s orange MS monogram (transparent PNG, shown with `object-contain`) |
| `public/media/hero/wrecker.jpg` | HwyWrk wrecker still used as the homepage hero background |
| `public/brand/favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Same logo on the site background colour |
| `public/brand/og-image.jpg` (1200×630 share image) | MS8000 studio hero render + logo |

The header wordmark (“MikeScripts”) is set in type rather than an image, so it stays sharp at every size. The colour accent (`#f97316`) is the MikeScripts brand orange, defined in `src/styles/index.css`.

## Product artwork (`public/media/`)

All converted from your original renders to WebP at 800 and 1600 px wide (hero images also 2400 px). 47 images, about 3 MB in total.

| Group | Images | Source folder |
| --- | --- | --- |
| `ms8000/*` | 23: studio exteriors, night ramp, cabin zones, flight deck, six liveries | `Documents/MS8000/deliverables/MS8000_Release/gallery/` |
| `ms100/*` | 10: exterior, cabin, apron scenes with the MS-E fleet | `Documents/MikeScripts_Store_Renders/MS-100/` and `/Apron/` |
| `mse/*` | 14: fleet lineups and all 11 units | `Documents/MikeScripts_Store_Renders/MS-E_Fleet/` |

Package images uploaded to Tebex are loaded live from Tebex and are not stored here. A product’s Tebex image is always preferred; local renders are added to its gallery.

## Missing or not used

| Item | Status | What to do |
| --- | --- | --- |
| Live product artwork | All 8 Tebex packages have images and gallery media; they load live from Tebex (including the FlightSim YouTube video). | Nothing. Update images in the Tebex panel. |
| MS-100 and MS-E fleet renders | Used for the “Included in this package” section of All-In-One Flight Simulator, the showcase and their install guides (both ship inside that package). | Nothing. Edit the `includes` list in `src/config/products.ts` if the package contents change. |
| MS_FlightSim mission photos | The photos in `MS_FlightSim/html/images/missions/` look like third-party stock photography, so they were **not** used. | Nothing needed; the Tebex images are used. |
| MS41s, MS_PhotoRadar | Still in development; not on the store. | Not referenced. |
| Customer reviews | None provided. | Add genuine reviews to `reviews` in `src/config/site.ts`. |
| Vector logo (SVG) | Only a 1024 px PNG exists. | Optional. A vector version would be sharper on high-DPI screens. |

## Adding or replacing images

**Replace in place:** overwrite `public/media/<id>-800.webp` and `<id>-1600.webp` (and `-2400` for hero images) with new files of the same names.

**Add a new image:** put the file in `public/media/` and add an entry to `src/config/media.ts`:

```ts
// a single file
'flightsim/tablet': { alt: 'MS_FlightSim pilot tablet', file: 'media/flightsim/tablet.jpg', width: 1920, height: 1080 },
// or responsive variants named flightsim/cockpit-800.webp and flightsim/cockpit-1600.webp
'flightsim/cockpit': { alt: 'MS_FlightSim cockpit HUD', widths: [800, 1600], width: 2560, height: 1440 },
```

Then reference the id from `products.ts` (`gallery`, `heroImage`), `showcase.ts` or `site.ts` (`hero.image`, `about.image`). Use 16:9 images at least 1600 px wide and always write a short, descriptive `alt` text.
