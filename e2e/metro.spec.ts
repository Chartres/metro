// Persona journey: Tomáš, Prague-history nerd, wants to WATCH the network grow
// and answer "when did my station open?" — the two things the toy exists for.
import { expect, test, type Page } from '@playwright/test'

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `e2e/shots/${name}.png`, fullPage: false })

test('today view: full network, stats honest, Line D dashed as future', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Prague Metro/)
  // today (init date): all 58 stations open on 3 lines
  await expect(page.locator('#statStations')).toHaveText('58')
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
  await shot(page, 'today')
})

test('time travel: 1974 opening day shows only the first 9 stations of line C', async ({ page }) => {
  await page.goto('/')
  // drag to the very beginning
  await page.locator('#slider').fill('0')
  await page.locator('#slider').dispatchEvent('input')
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
  // the jump landed mid-1978: line A's first 7 stations joined C's 13
  await expect(page.locator('#statLines')).toHaveText('2')
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
  await page.locator('#slider').fill('1000')
  await page.locator('#slider').dispatchEvent('input')
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
