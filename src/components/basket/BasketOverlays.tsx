import { useEffect } from 'react'
import { useBasket } from '../../state/basket-context'
import { Button } from '../ui/Button'
import { Drawer, Modal } from '../ui/Overlay'
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from '../ui/icons'
import { BasketItems, BasketSummary } from './BasketContents'

export function BasketDrawer() {
  const basket = useBasket()
  if (!basket.enabled) return null
  const hasItems = (basket.basket?.packages.length ?? 0) > 0
  return (
    <Drawer open={basket.drawerOpen} onClose={basket.closeDrawer} title="Your basket" footer={hasItems || basket.isAuthorized ? <BasketSummary /> : undefined}>
      <BasketItems onNavigate={basket.closeDrawer} />
    </Drawer>
  )
}

/** Shown only when Tebex offers more than one way to log in. */
export function AuthChooser() {
  const basket = useBasket()
  const methods = basket.authChoices
  return (
    <Modal open={Boolean(methods)} onClose={basket.cancelAuthChoice} title="Log in to continue">
      <p className="text-sm leading-relaxed text-mist-400">
        Choose the account to log in with. Your scripts are delivered to this account. You will return here afterwards.
      </p>
      <div className="mt-5 space-y-3">
        {(methods ?? []).map((method) => (
          <Button key={method.url} className="w-full" onClick={() => basket.chooseAuthMethod(method)}>
            Continue with {method.name}
          </Button>
        ))}
      </div>
    </Modal>
  )
}

/** Status messages from basket operations, announced to screen readers. */
export function BasketToaster() {
  const { message, dismissMessage } = useBasket()

  useEffect(() => {
    if (!message || message.tone === 'error') return
    const timer = window.setTimeout(dismissMessage, 5000)
    return () => window.clearTimeout(timer)
  }, [message, dismissMessage])

  const Icon = message?.tone === 'error' ? AlertIcon : message?.tone === 'success' ? CheckIcon : InfoIcon
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4">
      {message ? (
        <div
          className={`pointer-events-auto flex w-full max-w-md animate-fade-up items-start gap-3 rounded-lg border bg-ink-850 p-4 shadow-2xl shadow-black ${
            message.tone === 'error' ? 'border-danger-500/40' : 'border-ink-600'
          }`}
        >
          <Icon size={20} className={`mt-0.5 shrink-0 ${message.tone === 'error' ? 'text-danger-400' : message.tone === 'success' ? 'text-success-400' : 'text-accent-400'}`} />
          <p className="flex-1 text-sm leading-relaxed text-mist-200">{message.text}</p>
          <button type="button" onClick={dismissMessage} className="-m-1 rounded p-1 text-mist-500 hover:text-white" aria-label="Dismiss message">
            <CloseIcon size={16} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
