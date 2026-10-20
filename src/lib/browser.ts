export type BrowserName = 'edge' | 'brave' | 'firefox' | 'opera' | 'safari' | 'chrome' | 'other'

/** Best-effort browser detection, used only to show the right "how to unblock Tebex" steps. */
export function detectBrowser(userAgent: string = navigator.userAgent, isBrave = Boolean((navigator as Navigator & { brave?: unknown }).brave)): BrowserName {
  if (/\bEdg(e|A|iOS)?\//.test(userAgent)) return 'edge'
  if (isBrave) return 'brave'
  if (/\bOPR\/|\bOpera\b/.test(userAgent)) return 'opera'
  if (/\bFirefox\/|\bFxiOS\//.test(userAgent)) return 'firefox'
  if (/\bChrome\/|\bCriOS\//.test(userAgent)) return 'chrome'
  if (/\bSafari\//.test(userAgent)) return 'safari'
  return 'other'
}

export interface UnblockGuide {
  browser: string
  /** Most likely cause, shown first. */
  cause: string
  steps: string[]
  /** Optional alternative fix. */
  alternative?: string
}

const GENERIC: UnblockGuide = {
  browser: 'your browser',
  cause: 'A privacy setting, ad blocker, VPN or security software is blocking Tebex (headless.tebex.io) on this site.',
  steps: [
    'Pause any ad-blocking or privacy extension for this site.',
    'Turn off your VPN or proxy, if you use one.',
    'Reload this page.',
  ],
  alternative: 'Security software (antivirus or company protection) can also block it. Opening the store in a different browser usually works.',
}

const GUIDES: Partial<Record<BrowserName, UnblockGuide>> = {
  edge: {
    browser: 'Microsoft Edge',
    cause: 'Microsoft Edge’s tracking prevention is blocking Tebex on this site. InPrivate windows always use the strictest level.',
    steps: [
      'Click the lock icon to the left of the address bar.',
      'Turn off “Tracking prevention for this site”.',
      'Reload this page.',
    ],
    alternative: 'Or open Settings → Privacy, search, and services → Tracking prevention, and choose “Balanced”.',
  },
  brave: {
    browser: 'Brave',
    cause: 'Brave Shields are blocking Tebex on this site.',
    steps: ['Click the Brave Shields (lion) icon in the address bar.', 'Turn Shields off for this site.', 'Reload this page.'],
  },
  firefox: {
    browser: 'Firefox',
    cause: 'Firefox’s Enhanced Tracking Protection or an extension may be blocking Tebex on this site.',
    steps: [
      'Click the shield icon to the left of the address bar.',
      'Turn off Enhanced Tracking Protection for this site (the page reloads).',
    ],
    alternative: 'If that doesn’t help, pause ad-blocking or privacy extensions for this site.',
  },
  opera: {
    browser: 'Opera',
    cause: 'Opera’s built-in VPN or ad blocker may be blocking Tebex on this site.',
    steps: [
      'If “VPN” shows in the address bar, click it and turn the VPN off.',
      'Click the ad-blocker shield in the address bar and turn it off for this site.',
      'Reload this page.',
    ],
  },
}

export function unblockGuide(browser: BrowserName): UnblockGuide {
  return GUIDES[browser] ?? GENERIC
}
