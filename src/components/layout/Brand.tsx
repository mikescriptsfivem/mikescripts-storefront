import { Link } from 'react-router'
import { brand } from '../../config/media'
import { site } from '../../config/site'
import { publicAsset } from '../../lib/url'

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" onClick={onNavigate} className="group flex shrink-0 items-center gap-3" aria-label={`${site.name} home`}>
      <img src={publicAsset(brand.logoMarkSmall)} alt="" width={40} height={40} className="h-10 w-10" />
      <span className="font-display text-[22px] font-semibold uppercase tracking-[0.08em] text-white">
        Mike<span className="text-accent-400">Scripts</span>
      </span>
    </Link>
  )
}
