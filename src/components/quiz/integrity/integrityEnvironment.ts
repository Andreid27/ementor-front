/**
 * integrityEnvironment - Describes the student's device once, at the start of the quiz (contract section 6.4)
 *
 * Only what helps judge the record, and nothing that identifies the person beyond what their account already does.
 */

import type { IntegrityEnvironment } from './integrityTypes'

// userAgentData spells some platforms differently from the contract
const UA_DATA_PLATFORMS: Record<string, string> = { 'Chrome OS': 'ChromeOS', 'Chromium OS': 'ChromeOS' }

export const parsePlatform = (userAgent: string, maxTouchPoints: number, uaDataPlatform?: string): string | null => {
  if (uaDataPlatform && uaDataPlatform !== 'Unknown') {
    return Object.prototype.hasOwnProperty.call(UA_DATA_PLATFORMS, uaDataPlatform)
      ? UA_DATA_PLATFORMS[uaDataPlatform]
      : uaDataPlatform
  }

  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'

  // iPadOS asks for desktop sites with a Mac user agent, but a Mac has no touch screen
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'iOS'
  if (/Android/.test(userAgent)) return 'Android'
  if (/CrOS/.test(userAgent)) return 'ChromeOS'
  if (/Windows/.test(userAgent)) return 'Windows'
  if (/Mac OS X|Macintosh/.test(userAgent)) return 'macOS'
  if (/Linux/.test(userAgent)) return 'Linux'

  return null
}

export const detectDeviceType = (
  userAgent: string,
  maxTouchPoints: number,
  uaDataMobile?: boolean
): IntegrityEnvironment['deviceType'] => {
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(userAgent)) return 'TABLET'
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'TABLET'

  // Android phones say "Mobile" in the user agent, Android tablets do not
  if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) return 'TABLET'
  if (uaDataMobile || /Mobi|iPhone|iPod|Android/i.test(userAgent)) return 'PHONE'

  return 'DESKTOP'
}

type NavigatorWithUaData = Navigator & {
  userAgentData?: { brands?: { brand: string; version: string }[]; mobile?: boolean; platform?: string }
}

export const collectEnvironment = (): IntegrityEnvironment => {
  const nav = navigator as NavigatorWithUaData
  const screenInfo = window.screen as Screen & { isExtended?: boolean }
  const uaData = nav.userAgentData
  const maxTouchPoints = nav.maxTouchPoints || 0

  return {
    userAgent: nav.userAgent,
    uaBrands: uaData?.brands ? uaData.brands.map(({ brand, version }) => ({ brand, version })) : null,
    platform: parsePlatform(nav.userAgent, maxTouchPoints, uaData?.platform),
    deviceType: detectDeviceType(nav.userAgent, maxTouchPoints, uaData?.mobile),
    maxTouchPoints,
    screen: {
      width: screenInfo.width,
      height: screenInfo.height,
      availWidth: screenInfo.availWidth,
      availHeight: screenInfo.availHeight,
      pixelRatio: window.devicePixelRatio || 1
    },
    isExtendedScreen: typeof screenInfo.isExtended === 'boolean' ? screenInfo.isExtended : null,
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    },
    language: nav.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    webdriver: nav.webdriver === true,
    supports: {
      pageVisibility: typeof document.visibilityState === 'string',
      pageLifecycle: 'onfreeze' in document,
      intersectionObserver: typeof IntersectionObserver === 'function',
      screenIsExtended: 'isExtended' in screenInfo
    }
  }
}
