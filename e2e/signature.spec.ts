// Signature mechanics (docs/SIGNATURE.md). Persona: Jana, a teacher in Prague,
// wants to show a class how the city grew in one glance, then go deeper into one decade.
import { expect, test, type Page } from '@playwright/test'

const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
const shot = async (page: Page, name: string) => {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
  )
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false })
}

// Tufte, Envisioning Information (1990), "Small multiples": the same map at six dates,
// side by side, so the eye compares growth without animation or memory.
test('small multiples: six dated maps with honest station counts, each jumps the main map', async ({ page }) => {
  await page.goto('/')
  const tiles = page.locator('#multiples .multiple')
  await expect(tiles).toHaveCount(6)
  // counts derived by hand from the opening dates (shared interchanges counted once)
  await expect(tiles.locator('.mcount')).toHaveText(['9', '22', '38', '47', '54', '58'])
  await expect(tiles.locator('.myear')).toHaveText(['1974', '1980', '1990', '2000', '2010', 'Today'])
  // each tile draws only what ran by its date: 1974 has line C's 8 segments, nothing else
  const first = tiles.first()
  expect(await first.locator('line.on').count()).toBe(8)
  expect(await tiles.last().locator('line.on').count()).toBe(
    await page.locator('#liveLayer line').count(),
  )
  // a tile is a control: it moves the main map to its date
  await tiles.nth(2).click()
  await expect(page.locator('#dateLabel')).toHaveText('December 1990')
  await expect(page.locator('#statStations')).toHaveText('38')
  // the tile for the shown date is the current one (not a toggle: pressing again doesn't undo it)
  await expect(tiles.nth(2)).toHaveAttribute('aria-current', 'true')
  await expect(tiles.nth(5)).not.toHaveAttribute('aria-current', 'true')
  await expect(tiles.nth(2)).toHaveAttribute('aria-label', /1990.*38 stations/)
  await shot(page, 'small-multiples')
})

test('small multiples report the jump as a key_action', async ({ page }) => {
  await page.goto('/')
  const seen = await page.evaluate(() => {
    const got: unknown[] = []
    document.addEventListener('metro:action', (e) => got.push((e as CustomEvent).detail))
    const tiles = document.querySelectorAll('#multiples .multiple')
    ;(tiles[1] as HTMLElement).click()
    ;(tiles[5] as HTMLElement).click()
    return got
  })
  const thisYear = String(new Date().getFullYear())
  expect(seen).toEqual([
    { action: 'decade_jump', year: '1980', today: false },
    { action: 'decade_jump', year: thisYear, today: true },
  ])
})

test('keyboard: Enter on a small multiple jumps there', async ({ page }) => {
  await page.goto('/')
  await page.locator('#multiples .multiple').nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#statStations')).toHaveText('22')
})

// Minard (1869) put the quantity on the path itself; here the slider's track carries
// the network's size, so the timeline shows where growth happened before you scrub.
test('growth line: the timeline track draws stations open over time, and a marker follows the slider', async ({ page }) => {
  await page.goto('/')
  const growth = page.locator('#growth')
  await expect(growth).toBeVisible()
  await expect(growth).toHaveAttribute('role', 'img')
  await expect(growth).toHaveAttribute('aria-label', 'Stations open over time: 9 in 1974, 58 today')
  const sliderBox = (await page.locator('#slider').boundingBox())!
  const growthBox = (await growth.boundingBox())!
  // drawn on the slider's own x-scale: the thumb centre's travel, 8px inside each end
  expect(Math.abs(growthBox.x - (sliderBox.x + 8))).toBeLessThan(2)
  expect(Math.abs(growthBox.width - (sliderBox.width - 16))).toBeLessThan(2)
  const marker = page.locator('#growthNow')
  const yToday = (await marker.boundingBox())!.y
  await page.locator('#slider').fill('0')
  await page.locator('#slider').dispatchEvent('input')
  const m1974 = (await marker.boundingBox())!
  // 9 of 58 stations sits low on the track; today's 58 at the top
  expect(m1974.y).toBeGreaterThan(yToday + 10)
  expect(Math.abs(m1974.x - growthBox.x)).toBeLessThan(6)
  await shot(page, 'growth-1974')
})

test('phone (390px): Play and the small multiples are 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const play = (await page.locator('#playBtn').boundingBox())!
  expect(play.width).toBeGreaterThanOrEqual(44)
  expect(play.height).toBeGreaterThanOrEqual(44)
  for (const t of await page.locator('#multiples .multiple').all()) {
    const b = (await t.boundingBox())!
    expect(b.height).toBeGreaterThanOrEqual(44)
    expect(b.width).toBeGreaterThanOrEqual(44)
  }
  // no horizontal page scroll
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.locator('#multiples').scrollIntoViewIfNeeded()
  await shot(page, 'mobile-multiples-390')
})
