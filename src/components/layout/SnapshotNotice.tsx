import { useCatalog } from '../../state/catalog-context'
import { UnblockHelp } from '../UnblockHelp'
import { Container } from '../ui/layout'
import { InfoIcon } from '../ui/icons'

function formatSnapshotDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Shown under the menu while the saved catalogue is displayed because the browser can't reach Tebex. */
export function SnapshotNotice() {
  const { snapshotAt, retry } = useCatalog()
  if (!snapshotAt) return null
  return (
    <div role="status" className="border-b border-amber-500/25 bg-amber-500/[0.08]">
      <Container className="flex flex-col gap-2 py-2.5 text-[13px] leading-snug text-amber-100 sm:flex-row sm:items-center sm:gap-3">
        <p className="flex flex-1 items-start gap-3 sm:items-center">
          <InfoIcon size={16} className="mt-0.5 shrink-0 text-amber-300 sm:mt-0" />
          <span>
            <strong className="font-semibold text-amber-50">Your browser is blocking Tebex</strong>, so checkout here is unavailable and this is the
            catalogue saved on {formatSnapshotDate(snapshotAt)}. Buying opens the official Tebex store.
          </span>
        </p>
        <div className="flex shrink-0 gap-4 pl-7 sm:pl-0">
          <UnblockHelp className="font-semibold text-amber-200 underline underline-offset-2 hover:text-white" />
          <button type="button" onClick={retry} className="font-semibold text-amber-200 underline-offset-2 hover:underline">
            Try again
          </button>
        </div>
      </Container>
    </div>
  )
}
