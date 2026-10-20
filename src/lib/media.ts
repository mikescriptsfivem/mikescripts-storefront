import { media, type MediaAsset, type MediaId } from '../config/media'
import { publicAsset } from './url'

/** src/srcSet for an image in the media manifest. */
export function mediaSources(id: MediaId): { src: string; srcSet?: string } {
  const asset: MediaAsset = media[id]
  if (asset.file) return { src: publicAsset(asset.file) }
  const files = (asset.widths ?? []).map((width) => ({ width, url: publicAsset(`media/${id}-${width}.webp`) }))
  const fallback = files[Math.min(1, files.length - 1)]
  return {
    src: fallback?.url ?? '',
    srcSet: files.length > 1 ? files.map((file) => `${file.url} ${file.width}w`).join(', ') : undefined,
  }
}

/** Largest available file for an image (used in the lightbox and for share previews). */
export function mediaLargest(id: MediaId): string {
  const asset: MediaAsset = media[id]
  if (asset.file) return publicAsset(asset.file)
  const widths = asset.widths ?? []
  const largest = widths[widths.length - 1]
  return largest ? publicAsset(`media/${id}-${largest}.webp`) : ''
}
