// Persona journey: Tomáš, Prague-history nerd, wants to WATCH the network grow
// and answer "when did my station open?" — the two things the toy exists for.
import { expect, test, type Page } from '@playwright/test'

// Wait out CSS transitions (0.35 s segment/station fades) so a shot never shows a
// half-faded state; the flash-ring keyframe animations are left running on purpose,
// so pixels differ every run: shots land in e2e/shots/ (tracked) only with UPDATE_SHOTS=1.
const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
const shot = async (page: Page, name: string) => {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
  )
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false })
}

// fill() alone doesn't fire `input` on a range control — the app listens for it.
const scrubTo = async (page: Page, value: string | number) => {
  const slider = page.locator('#slider')
  await slider.fill(String(value))
  await slider.dispatchEvent('input')
}

test('today view: full network, stats honest, Line D open', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Prague Metro/)
  // today (landing view): all 64 stations open on 4 lines (Line D Phase 1 opened 2024-12-19)
  await expect(page.locator('#statStations')).toHaveText('64')
  await expect(page.locator('#statTotal')).toHaveText('64')
  await expect(page.locator('#statLines')).toHaveText('4')
  await expect(page.locator('#dateLabel')).toHaveText(
    new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
  )
  // Only the paper-only Phase 2 leg (Náměstí Míru–Pankrác) remains future/planned
  expect(await page.locator('.segment.future').count()).toBe(1) // 1 planned Phase 2 leg
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
  expect(strokes).toEqual(['#0f5cab', '#2e8b3d', '#da251c', '#f0b400'])
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
  // the tooltip names the station as it was called on that date
  await page.locator('.station[data-id="dejvicka"]').dispatchEvent('mouseenter')
  await expect(page.locator('#tooltip b')).toHaveText('Leninova')
  // and a screen reader hears the name the map shows
  await expect(page.locator('.station[data-id="dejvicka"]')).toHaveAttribute('aria-label', 'Leninova')
  await page.locator('.station[data-id="dejvicka"]').dispatchEvent('mouseleave')
  await shot(page, 'former-names-1988')
  // and back to today the modern name holds
  await scrubTo(page, 1000)
  await expect(page.locator('.station[data-id="dejvicka"] text')).toHaveText('Dejvická')
  await expect(page.locator('.station[data-id="dejvicka"]')).toHaveAttribute('aria-label', 'Dejvická')
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

test('every timeline event click shows that event\'s date, not the nearest slider step', async ({ page }) => {
  await page.goto('/')
  // a slider step is ~20 days: rounding to it landed up to ~10 days early (the
  // state before the event), ceil landed up to ~20 days late (Nov 1990 read December)
  const months: string[] = await page.evaluate(
    `EVENTS.map((e) => new Date(e.date + 'T12:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))`,
  )
  const items = page.locator('.ev')
  expect(await items.count()).toBe(months.length)
  for (let i = 0; i < months.length; i++) {
    await items.nth(i).click()
    await expect(items.nth(i)).toHaveClass(/active/)
    await expect(page.locator('#dateLabel')).toHaveText(months[i])
  }
})

test('landing view shows today\'s month even when the slider step falls in the next one', async ({ page }) => {
  // 30 Oct 2026: the first slider step on or after it is 18 Nov 2026
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00Z'))
  await page.goto('/')
  await expect(page.locator('#dateLabel')).toHaveText('October 2026')
})

test('stations not yet open ignore the pointer and leave the tab order', async ({ page }) => {
  await page.goto('/')
  await page.locator('.ev', { hasText: 'Prague Metro opens' }).click()
  const dejvicka = page.locator('.station[data-id="dejvicka"]') // Line A, 1978
  await expect(dejvicka).toHaveCSS('pointer-events', 'none')
  await expect(dejvicka).toHaveAttribute('tabindex', '-1')
  const florenc = page.locator('.station[data-id="florenc"]') // Line C, opening day
  await expect(florenc).not.toHaveCSS('pointer-events', 'none')
  await expect(florenc).toHaveAttribute('tabindex', '0')
})

test('keyboard: Enter on an event jumps to it, Space on a station opens its detail', async ({ page }) => {
  await page.goto('/')
  const ev = page.locator('.ev', { hasText: 'Line A opens' })
  await ev.focus()
  await page.keyboard.press('Enter')
  await expect(ev).toHaveClass(/active/)
  await expect(page.locator('#statStations')).toHaveText('15')
  await page.locator('.station[data-id="muzeum"]').focus()
  await page.keyboard.press('Space')
  await expect(page.locator('#detailPanel h3')).toHaveText('Muzeum')
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
  await expect(page.locator('#statStations')).toHaveText('64')
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

test.describe('east of UTC (Europe/Prague)', () => {
  test.use({ timezoneId: 'Europe/Prague' })
  test('landing view uses the local date: 00:30 on 1 Nov in Prague is November', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-31T23:30:00Z')) // 2026-11-01 00:30 CET
    await page.goto('/')
    await expect(page.locator('#dateLabel')).toHaveText('November 2026')
  })
})

test.describe('west of UTC (America/Los_Angeles)', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })
  test('landing view uses the local date: 22:00 on 31 Oct in LA is October', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-01T05:00:00Z')) // 2026-10-31 22:00 PDT
    await page.goto('/')
    await expect(page.locator('#dateLabel')).toHaveText('October 2026')
  })
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
  const rings = page.locator('#flashLayer circle')
  const banner = page.locator('#eventBanner')
  await btn.click()
  expect(Number(await page.locator('#slider').inputValue())).toBeLessThan(5)
  // opening day fires exactly once: its 9 rings and its banner. A stale
  // prevDateStr flashes every event (~150 rings); a reset to START flashes none.
  await expect(rings).toHaveCount(9)
  await expect(banner).toContainText('Prague Metro opens')
  await btn.click()
  // and again from the very end of the slider
  await scrubTo(page, 1000)
  await expect(rings).toHaveCount(0) // the scrub's ~150 rings expire after 2.9 s
  await expect(banner).not.toContainText('Prague Metro opens')
  await btn.click()
  expect(Number(await page.locator('#slider').inputValue())).toBeLessThan(5)
  await expect(rings).toHaveCount(9)
  await expect(banner).toContainText('Prague Metro opens')
  await btn.click()
})

test('Play button: starts playback, button becomes Pause, slider advances, then pauses', async ({ page }) => {
  await page.goto('/')
  const btn = page.locator('#playBtn')
  await btn.click()
  await expect(btn).toHaveText('⏸')
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
  await expect(btn).toHaveAttribute('aria-label', 'Pause')
  // the date label changes ~100×/s during Play; as a live region it would flood a
  // screen reader (the slider's aria-valuetext already carries the date)
  await expect(page.locator('#dateLabel')).not.toHaveAttribute('aria-live')
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
