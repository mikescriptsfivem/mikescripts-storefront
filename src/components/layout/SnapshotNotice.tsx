import { useCatalog } from '../../state/catalog-context'
import { Container } from '../ui/layout'
import { InfoIcon } from '../ui/icons'

function formatSnapshotDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Shown under the menu while the saved catalogue is displayed because Tebex can't be reached. */
export function SnapshotNotice() {
  const { snapshotAt, retry } = useCatalog()
  if (!snapshotAt) return null
  return (
    <div role="status" className="border-b border-amber-500/25 bg-amber-500/[0.08]">
      <Container className="flex items-start gap-3 py-2.5 text-[13px] leading-snug text-amber-100 sm:items-center">
        <InfoIcon size={16} className="mt-0.5 shrink-0 text-amber-300 sm:mt-0" />
        <p className="flex-1">
          Your browser couldn’t reach Tebex, so this is the catalogue saved on {formatSnapshotDate(snapshotAt)}. Buying opens the official Tebex store, which
          shows the current price.
        </p>
        <button type="button" onClick={retry} className="shrink-0 font-semibold text-amber-200 underline-offset-2 hover:underline">
          Try again
        </button>
      </Container>
    </div>
  )
}
