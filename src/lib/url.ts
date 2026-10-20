import { env } from '../config/env'

/** Path to a file in /public, respecting the deploy base path ("brand/logo.png" → "/repo/brand/logo.png"). */
export function publicAsset(path: string): string {
  return `${env.baseUrl}${path.replace(/^\/+/, '')}`
}

/** Absolute URL for an app route, e.g. appUrl('/basket') → "https://user.github.io/repo/basket". */
export function appUrl(path: string): string {
  return new URL(path.replace(/^\/+/, ''), `${window.location.origin}${env.baseUrl}`).toString()
}

export function isExternalUrl(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:')
}

/** YouTube video id from youtu.be, watch?v=, /embed/, /shorts/ or /live/ links. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    let id: string | null = null
    if (parsed.hostname === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0] ?? null
    else if (/(^|\.)youtube(-nocookie)?\.com$/.test(parsed.hostname)) {
      id = parsed.pathname === '/watch' ? parsed.searchParams.get('v') : (/^\/(embed|shorts|live)\/([^/?]+)/.exec(parsed.pathname)?.[2] ?? null)
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null
  } catch {
    return null
  }
}

/** Official Tebex package page, used when a package needs input this site cannot collect. */
export function tebexPackageUrl(storeUrl: string, packageId: number): string {
  return `${storeUrl.replace(/\/+$/, '')}/package/${packageId}`
}
