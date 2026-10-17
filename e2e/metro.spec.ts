// Persona journey: Tomáš, Prague-history nerd, wants to WATCH the network grow
// and answer "when did my station open?" — the two things the toy exists for.
import { expect, test, type Page } from '@playwright/test'

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `e2e/shots/${name}.png`, fullPage: false })

// fill() alone doesn't fire `input` on a range control — the app listens for it.
const scrubTo = async (page: Page, value: string | number) => {
  const slider = page.locator('#slider')
  await slider.fill(String(value))
  await slider.dispatchEvent('input')
}

test('today view: full network, stats honest, Line D dashed as future', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Prague Metro/)
  // today (landing view): all 58 stations open on 3 lines, total derived from the data
  await expect(page.locator('#statStations')).toHaveText('58')
  await expect(page.locator('#statTotal')).toHaveText('58')
  await expect(page.locator('#statLines')).toHaveText('3')
  // Line D exists only as under-construction dashes, never as an open line —
  // and it is BLUE (official DPP color), with the paper-only phase II
  // (Náměstí Míru–Pankrác) as a lighter dotted leg
  const future = page.locator('.segment.future.on').first()
  await expect(future).toBeVisible()
  await expect(future).toHaveAttribute('class', /future/)
  expect(await page.locator('.segment.future').count()).toBe(6) // 5 construction + 1 planned
  await expect(page.locator('.segment.future.planned')).toHaveClass(/on/)
  const dColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--d-color').trim(),
  )
  expect(dColor).toBe('#0f5cab')
  // segment strokes are read back from the :root custom properties — an empty
  // or drifted lookup would paint the live network black
  const strokes = await page
    .locator('#liveLayer line')
    .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('stroke')))].sort())
  expect(strokes).toEqual(['#2e8b3d', '#da251c', '#f0b400'])
  await shot(page, 'today')
})

test('time travel: 1974 opening day shows only the first 9 stations of line C', async ({ page }) => {
  await page.goto('/')
  // drag to the very beginning
  await scrubTo(page, 0)
  await expect(page.locator('#statStations')).toHaveText('9')
  await expect(page.locator('#statLines')).toHaveText('1')
  // let the scrub-crossing flashrings (one per crossed event) finish before
  // the committed shot, so it shows the honest 1974 state
  await page.waitForTimeout(3200)
  await shot(page, 'opening-day-1974')
})

test('timeline event click jumps the map and flashes the banner', async ({ page }) => {
  await page.goto('/')
  await page.locator('.ev', { hasText: 'Line A opens' }).click()
  await expect(page.locator('#eventBanner')).toHaveClass(/show/)
  await expect(page.locator('#eventBanner')).toContainText('Line A opens')
  // C's 9 original stations + A's 7 − 1 shared interchange (Muzeum) = 15 unique open
  await expect(page.locator('#statLines')).toHaveText('2')
  await expect(page.locator('#statStations')).toHaveText('15')
  await shot(page, 'event-jump-1978')
})

test('station detail: Muzeum shows both lines and its opening dates', async ({ page }) => {
  await page.goto('/')
  // dispatchEvent, not click: the <g> bbox includes the label, so the pointer
  // midpoint can land on a neighboring station in the dense city centre
  await page.locator('.station[data-id="muzeum"]').dispatchEvent('click')
  const detail = page.locator('#detailPanel')
  await expect(detail).toBeVisible()
  await expect(detail.locator('h3')).toHaveText('Muzeum')
  await expect(detail).toContainText('Opened on Line A: 1978-08-12')
  await expect(detail).toContainText('Opened on Line C: 1974-05-09')
  await shot(page, 'station-detail')
})

test('renamed stations show communist-era names before Feb 1990', async ({ page }) => {
  await page.goto('/')
  // jump to just after the 1988 extension, before the Velvet Revolution renames
  await page.locator('.ev', { hasText: 'Nové Butovice' }).click()
  await expect(page.locator('.station[data-id="dejvicka"] text')).toHaveText('Leninova')
  await shot(page, 'former-names-1988')
  // and back to today the modern name holds
  await scrubTo(page, 1000)
  await expect(page.locator('.station[data-id="dejvicka"] text')).toHaveText('Dejvická')
})

test('phone (390px): map fills the width at content aspect, panels stack below', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const map = (await page.locator('#mapCol svg').boundingBox())!
  const col = (await page.locator('#mapCol').boundingBox())!
  const side = (await page.locator('#side').boundingBox())!
  expect(map.width).toBeGreaterThan(380) // full-bleed, not squeezed beside a sidebar
  // aspect-matched svg = zero letterbox: height ≈ width * 880/1180
  expect(Math.abs(map.height - (map.width * 880) / 1180)).toBeLessThan(4)
  expect(side.y).toBeGreaterThanOrEqual(col.y + col.height - 1) // stacked, not beside
  // the legend is a strip below the map on phones, never an overlay eating it
  const legend = (await page.locator('#legend').boundingBox())!
  expect(legend.y).toBeGreaterThanOrEqual(map.y + map.height - 1)
  // sub-4px station labels are hidden on phones; dots + tap → detail carry names
  await expect(page.locator('.station[data-id="muzeum"] text')).toBeHidden()
  await shot(page, 'mobile-390')
})

test('every timeline event click lands on or after its date', async ({ page }) => {
  await page.goto('/')
  // Math.round in sliderFromDate could land up to ~10 days early, showing the
  // state before the event (and highlighting the previous one)
  const items = page.locator('.ev')
  const n = await items.count()
  for (let i = 0; i < n; i++) {
    await items.nth(i).click()
    await expect(items.nth(i)).toHaveClass(/active/)
  }
})

test('history data matches the Wikipedia-checked answers', async ({ page }) => {
  await page.goto('/')
  // Line B runs Nové Butovice → Jinonice → Radlická → Smíchovské nádraží → Anděl
  expect(await page.evaluate('LINE_ORDER.B.slice(5, 11)')).toEqual([
    'nove_butovice', 'jinonice', 'radlicka', 'smichovske_nadrazi', 'andel', 'karlovo_namesti',
  ])
  expect(await page.evaluate('[OPEN.A.strasnicka, OPEN.A.skalka]')).toEqual(['1987-07-11', '1990-07-04'])
  // the 1985 Line B opening had 7 stations, Florenc to Smíchovské nádraží
  expect(await page.evaluate('EVENTS.find((e) => e.title === "Line B opens").stations.length')).toBe(7)
})

test('page loads without console errors (the station-order self-check reports there)', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.locator('#statStations')).toHaveText('58')
  expect(errors).toEqual([])
})

test('Line B stays drawn through the 1998–2001 infill-station gap', async ({ page }) => {
  await page.goto('/')
  await scrubTo(page, await page.evaluate('sliderFromDate("2000-01-01")'))
  // all 23 Line B segments run in 2000, though Kolbenova only opened in 2001
  const liveB = await page
    .locator('#liveLayer line[stroke="#f0b400"]')
    .evaluateAll((els) => els.filter((e) => (e as SVGElement).style.opacity === '0.95').length)
  expect(liveB).toBe(23)
})

test.describe('west of UTC (America/Los_Angeles)', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })
  test('dates are not shown a day or a month early', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ev', { hasText: 'Line D construction begins' }).locator('.evdate')).toHaveText(
      '1 Mar 2022',
    )
    // every slider position that falls on the 1st of a month labels that month
    const wrong = await page.evaluate(`(() => {
      const bad = []
      for (let v = 0; v <= 1000; v++) {
        const d = dateStrFromSliderVal(v)
        if (!d.endsWith('-01')) continue
        render(d)
        const want = new Date(d + 'T00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        if (document.getElementById('dateLabel').textContent !== want) bad.push(d)
      }
      return bad
    })()`)
    expect(wrong).toEqual([])
  })
})

test('Play from the landing view replays from 1974, flashing only opening day', async ({ page }) => {
  await page.goto('/')
  await page.locator('#speed').selectOption('60') // slowest: the next event is ~4 s away
  const btn = page.locator('#playBtn')
  await btn.click()
  expect(Number(await page.locator('#slider').inputValue())).toBeLessThan(5)
  // a stale prevDateStr would flash every event's rings (~150) at once
  expect(await page.locator('#flashLayer circle').count()).toBeLessThanOrEqual(9)
  await btn.click()
  // and again from the very end of the slider
  await scrubTo(page, 1000)
  await page.waitForTimeout(3000) // let earlier rings expire
  await btn.click()
  expect(Number(await page.locator('#slider').inputValue())).toBeLessThan(5)
  expect(await page.locator('#flashLayer circle').count()).toBeLessThanOrEqual(9)
  await btn.click()
})

test('Play button: starts playback, button becomes Pause, slider advances, then pauses', async ({ page }) => {
  await page.goto('/')
  const btn = page.locator('#playBtn')
  await btn.click()
  await expect(btn).toHaveText('⏸')
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await expect(btn).toHaveAttribute('aria-label', 'Pause')
  const started = Number(await page.locator('#slider').inputValue())
  // wait for slider to advance (speed=10ms/tick by default)
  await page.waitForFunction(
    (n) => Number((document.getElementById('slider') as HTMLInputElement).value) > n,
    started,
    { timeout: 3000 },
  )
  await btn.click()
  await expect(btn).toHaveText('▶')
  await expect(btn).toHaveAttribute('aria-pressed', 'false')
  await expect(btn).toHaveAttribute('aria-label', 'Play')
})

test('Play button: conversion key written to sessionStorage on first press only', async ({ page }) => {
  await page.goto('/')
  const key = () => page.evaluate(() => sessionStorage.getItem('metro_conversion_fired'))
  expect(await key()).toBeNull()
  await page.locator('#playBtn').click()
  expect(await key()).toBe('1')
  // pause to keep the page clean for any later tests
  await page.locator('#playBtn').click()
})

// Discoverability kit (flywheel Standard §5c): what crawlers, link unfurlers and AI
// agents read. Asserted by content-type too — an SPA fallback answers 200 text/html
// for anything missing.
test('discoverability kit: robots, sitemap, llms.txt, security.txt, 1200×630 share card', async ({
  page,
  request,
}) => {
  const robots = await request.get('/robots.txt')
  expect(robots.headers()['content-type']).toMatch(/^text\/plain/)
  const txt = await robots.text()
  expect(txt).toMatch(/^User-agent: \*\nAllow: \/$/m)
  expect(txt).toContain('User-agent: ClaudeBot')
  expect(txt).toContain('Sitemap: https://metro.dravec.org/sitemap.xml')

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.headers()['content-type']).toMatch(/xml/)
  expect(await sitemap.text()).toContain('<loc>https://metro.dravec.org/</loc>')

  const llms = await request.get('/llms.txt')
  expect(llms.headers()['content-type']).toMatch(/^text\/plain/)
  expect((await llms.text()).startsWith('# Prague Metro')).toBe(true)

  const sec = await request.get('/.well-known/security.txt')
  expect(await sec.text()).toMatch(/^Contact: https:\/\//m)

  const og = await request.get('/og.png')
  expect(og.headers()['content-type']).toBe('image/png')
  const png = await og.body()
  expect(png.readUInt32BE(16)).toBe(1200) // IHDR width
  expect(png.readUInt32BE(20)).toBe(630) // IHDR height

  await page.goto('/')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://metro.dravec.org/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://metro.dravec.org/og.png')
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}')
  expect(ld['@type']).toBe('WebApplication')
  expect(ld.url).toBe('https://metro.dravec.org/')
})
