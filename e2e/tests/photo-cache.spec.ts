/**
 * The photo cache's request budget, which keeps a failing photo service from being flooded by its own pages.
 * Runs the app's real cache (exposed as window.__photoCache in development) against mocked photo responses.
 */
import type { Page, Route } from '@playwright/test'
import { test, expect } from '../support/fixtures'

const PHOTO_REQUESTS = /\/(thumbnail|profile-image)\/download\//

const sourcesFor = (photoId: string, preferred: 'thumb' | 'full') => {
  const thumb = { kind: 'API', url: `/service2/thumbnail/download/${photoId}`, photoId }
  const full = { kind: 'API', url: `/service2/profile-image/download/${photoId}`, photoId }

  return preferred === 'thumb' ? [thumb, full] : [full, thumb]
}

// Any app page loads the cache. /callback is a guest page that, without a code or a stored token, stays put;
// other pages send a signed-out visitor on to Keycloak, which would wipe the page mid-test.
const openApp = async (page: Page) => {
  await page.goto('/callback')
  await page.waitForFunction(() => Boolean((window as any).__photoCache))
  await page.evaluate(() => (window as any).__photoCache.clear())
}

const countPhotoRequests = async (page: Page, respond: (route: Route) => Promise<void>) => {
  const sent: string[] = []
  await page.route(PHOTO_REQUESTS, route => {
    sent.push(route.request().url())

    return respond(route)
  })

  return sent
}

test.describe('Photo cache request budget', () => {
  test('one failing photo costs at most 3 requests, even with both sizes loading at once', async ({ page }) => {
    await openApp(page)
    const sent = await countPhotoRequests(page, route => route.fulfill({ status: 500, body: '{"message":"File cannot be read"}' }))

    const results = await page.evaluate(
      async ([thumbFirst, fullFirst]) => {
        const cache = (window as any).__photoCache

        return Promise.all([cache.load(thumbFirst), cache.load(fullFirst)])
      },
      [sourcesFor('budget-photo', 'thumb'), sourcesFor('budget-photo', 'full')]
    )

    expect(results).toEqual([null, null])
    expect(sent.length).toBeLessThanOrEqual(3)

    // Within the pause, showing the photo again sends nothing
    const before = sent.length
    await page.evaluate(sources => (window as any).__photoCache.load(sources), sourcesFor('budget-photo', 'thumb'))
    expect(sent.length).toBe(before)
  })

  test('a photo the service has no record of is asked for once', async ({ page }) => {
    await openApp(page)
    const sent = await countPhotoRequests(page, route =>
      route.fulfill({ status: 500, body: '{"message":"ProfilePicture not found"}' })
    )

    await page.evaluate(sources => (window as any).__photoCache.load(sources), [sourcesFor('missing-photo', 'thumb')[0]])

    expect(sent.length).toBe(1)
  })

  test('at most 4 photo requests are in flight at once', async ({ page }) => {
    await openApp(page)
    let inFlight = 0
    let maxInFlight = 0
    await countPhotoRequests(page, async route => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise(resolve => setTimeout(resolve, 300))
      inFlight--
      await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('89504e470d0a1a0a', 'hex') })
    })

    await page.evaluate(
      sourceLists => Promise.all(sourceLists.map((sources: any) => (window as any).__photoCache.load(sources))),
      Array.from({ length: 10 }, (_, i) => [sourcesFor(`parallel-${i}`, 'thumb')[0]])
    )

    expect(maxInFlight).toBeLessThanOrEqual(4)
  })

  test('logging out drops the queued photo requests unsent', async ({ page }) => {
    await openApp(page)
    const sent = await countPhotoRequests(page, async route => {
      await new Promise(resolve => setTimeout(resolve, 1_000))
      await route.fulfill({ status: 500, body: '{}' }).catch(() => {})
    })

    const afterLogout = await page.evaluate(async sourceLists => {
      const cache = (window as any).__photoCache
      const loads = sourceLists.map((sources: any) => cache.load(sources))
      await new Promise(resolve => setTimeout(resolve, 100))
      cache.clear()
      const results = await Promise.all(loads)

      return { results, stats: cache.stats() }
    }, Array.from({ length: 10 }, (_, i) => sourcesFor(`queued-${i}`, 'thumb')))

    // Only the 4 already in flight were sent; the 6 waiting for a slot never were, and no chain moved on to
    // its second size after the logout
    await page.waitForTimeout(2_500)
    expect(sent.length).toBe(4)
    expect(sent.filter(url => url.includes('/profile-image/'))).toEqual([])
    expect(afterLogout.results.every((url: string | null) => url === null)).toBe(true)
    expect(afterLogout.stats).toMatchObject({ loaded: 0, apiRequestsWaiting: 0 })
  })

  test('a photo that does not display is not downloaded again within the minute', async ({ page }) => {
    await openApp(page)
    const sent = await countPhotoRequests(page, route =>
      route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('89504e470d0a1a0a', 'hex') })
    )

    const second = await page.evaluate(async sources => {
      const cache = (window as any).__photoCache
      const url = await cache.load(sources)
      cache.forget(url)

      return cache.load(sources)
    }, [sourcesFor('broken-image', 'thumb')[0]])

    expect(second).toBeNull()
    expect(sent.length).toBe(1)
  })
})
