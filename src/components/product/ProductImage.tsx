import type { Product } from '../../lib/catalog'
import { Picture, RemoteImage } from '../ui/Picture'

interface ProductImageProps {
  product: Product
  sizes?: string
  priority?: boolean
  className?: string
  /** Use the local hero artwork (if configured) even when Tebex has an image. */
  preferLocal?: boolean
}

/** Tebex package image first, then local artwork from products.ts, then a branded fallback tile. */
export function ProductImage({ product, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', priority, className = '', preferLocal = false }: ProductImageProps) {
  const local = product.content?.heroImage
  if (local && (preferLocal || !product.image)) {
    return <Picture id={local} alt={product.name} sizes={sizes} priority={priority} className={className} />
  }
  return <RemoteImage src={product.image} alt={product.name} fallbackLabel={product.name} priority={priority} className={className} />
}
