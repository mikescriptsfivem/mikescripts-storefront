import { appUrl } from './url'

/** Query parameter added to the return URL so the app knows the customer is back from Tebex login. */
export const AUTH_RETURN_PARAM = 'tebex_auth'

let returnedFromLogin: boolean | null = null

/**
 * True when this page load is the redirect back from Tebex login.
 * The first call also removes the marker from the address bar. Call it once before the router starts.
 */
export function isAuthReturn(): boolean {
  if (returnedFromLogin === null) {
    const url = new URL(window.location.href)
    returnedFromLogin = url.searchParams.has(AUTH_RETURN_PARAM)
    if (returnedFromLogin) {
      url.searchParams.delete(AUTH_RETURN_PARAM)
      window.history.replaceState(window.history.state, '', url.toString())
    }
  }
  return returnedFromLogin
}

/** The URL Tebex should send the customer back to after logging in (the current page by default). */
export function authReturnUrl(path?: string): string {
  const url = new URL(path ? appUrl(path) : window.location.href)
  url.searchParams.set(AUTH_RETURN_PARAM, '1')
  url.hash = ''
  return url.toString()
}
