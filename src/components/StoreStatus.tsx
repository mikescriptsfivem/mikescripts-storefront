import { env } from '../config/env'
import { site } from '../config/site'
import { useCatalog } from '../state/catalog-context'
import { Button, LinkButton } from './ui/Button'
import { Notice } from './ui/feedback'
import { ExternalIcon } from './ui/icons'

/** Shown wherever live Tebex data is needed but unavailable (not configured, offline or erroring). */
export function StoreStatus({ className = '' }: { className?: string }) {
  const { status, error, retry } = useCatalog()
  const storeLink = (
    <LinkButton to={site.links.store} variant="secondary">
      Open the official store
      <ExternalIcon size={16} />
    </LinkButton>
  )

  if (status === 'unconfigured') {
    return (
      <Notice title="The live catalogue is not connected yet" className={className} actions={storeLink}>
        {env.isDev ? (
          <p>
            Developer note: set <code className="text-mist-200">VITE_TEBEX_PUBLIC_TOKEN</code> in <code className="text-mist-200">.env.local</code>{' '}
            and restart the dev server. See README.md → “Connect Tebex”.
          </p>
        ) : (
          <p>You can browse and buy every script on the official MikeScripts store in the meantime.</p>
        )}
      </Notice>
    )
  }

  if (status === 'error') {
    return (
      <Notice
        tone="error"
        title="We couldn’t load the scripts from Tebex"
        className={className}
        actions={
          <>
            <Button onClick={retry}>Try again</Button>
            {storeLink}
          </>
        }
      >
        <p>{error?.message ?? 'Please try again in a moment.'}</p>
      </Notice>
    )
  }

  return null
}
