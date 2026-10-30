// Pavol's picks of 30 Oct 2026 (docs/SIGNATURE.md, decision log), one persona journey each,
// on a 390 px phone: the small multiples at the top of the Timeline panel, Line D drawn only
// where building has started, and the Czech section on the same page.
import { expect, test, type Page } from '@playwright/test'

const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
const shot = async (page: Page, name: string) => {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
  )
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false })
}
const actions = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { seen: Record<string, unknown>[] }
    w.seen = []
    document.addEventListener('metro:action', (e) => w.seen.push((e as CustomEvent).detail))
  })
const seen = (page: Page) =>
  page.evaluate(() => (window as unknown as { seen: Record<string, unknown>[] }).seen)
// the build date as vite.config.ts stamps it: Prague's calendar date at build time
const pragueDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague' }).format(now)

test.use({ viewport: { width: 390, height: 844 } })

// Jana, a teacher, opens the site on her phone in class and wants the whole history in one look.
test('Jana (390px): the six multiples open the Timeline panel and jump the map to their dates', async ({ page }) => {
  await page.goto('/')
  await actions(page)
  // first thing in the Timeline panel, above the first event
  const firstChild = await page.locator('#eventsList > *').first().getAttribute('id')
  expect(firstChild).toBe('multiples')
  const tiles = page.locator('#multiples .multiple')
  const firstEvent = (await page.locator('#eventsList .ev').first().boundingBox())!
  expect((await tiles.last().boundingBox())!.y).toBeLessThan(firstEvent.y)
  // opening day, the year-ends of 1980–2010, and today = the build date
  const built = (await page.evaluate('BUILD_DATE')) as string
  // stamped at build time, not the fallback; the e2e build ran minutes ago (maybe across Prague midnight)
  expect(await page.evaluate('BUILD_DATE_RAW')).toBe(built)
  expect([pragueDate(), pragueDate(new Date(Date.now() - 3600000))]).toContain(built)
  const dates = await tiles.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.date))
  expect(dates).toEqual(['1974-05-09', '1980-12-31', '1990-12-31', '2000-12-31', '2010-12-31', built])
  expect(await page.evaluate('START')).toBe('1974-05-09')
  await expect(tiles.locator('.mcount')).toHaveText(['9', '22', '38', '47', '54', '58'])
  await expect(tiles.first()).toHaveAttribute('aria-label', 'Jump to 9 May 1974: 9 stations')
  await expect(tiles.last()).toHaveAttribute('aria-label', /^Jump to today, .*: 58 stations$/)
  // on landing (today) the Today tile is the current one
  await expect(tiles.last()).toHaveAttribute('aria-current', 'true')
  await tiles.first().click()
  await expect(page.locator('#dateLabel')).toHaveText('May 1974')
  await expect(page.locator('#statStations')).toHaveText('9')
  await expect(page.locator('#statLines')).toHaveText('1')
  await expect(tiles.first()).toHaveAttribute('aria-current', 'true')
  expect(await seen(page)).toEqual([{ action: 'decade_jump', year: '1974', today: false, date: '1974-05-09' }])
  await page.locator('#multiples').scrollIntoViewIfNeeded()
  await shot(page, 'picks-multiples-390')
})

// Tomáš, a Prague-history nerd, checks what is really being built on line D and where the date comes from.
test('Tomáš (390px): Line D shows only the two sections being built, each with its start and source', async ({ page }) => {
  await page.goto('/')
  await actions(page)
  await expect(page.locator('#legend')).not.toContainText('planned')
  expect(await page.locator('.segment.future.on').count()).toBe(4)
  for (const id of ['libus', 'pisnice', 'depo_pisnice'])
    await expect(page.locator(`.station[data-id="${id}"]`)).toHaveCount(0)
  // no ghost either for the leg north of Pankrác (Náměstí Míru – Pankrác has no construction start)
  const ghostToNamestiMiru = await page.evaluate(
    `[...document.querySelectorAll('#ghostLayer line')].filter((l) => l.getAttribute('x1') == S.namesti_miru.x && l.getAttribute('x2') == S.pankrac.x).length`,
  )
  expect(ghostToNamestiMiru).toBe(0)
  await shot(page, 'picks-line-d-390')

  await page.locator('.station[data-id="rysanka"]').click()
  await page.mouse.move(0, 0)
  const detail = page.locator('#detailPanel')
  await expect(detail).toContainText('under construction')
  await expect(detail).toContainText('Pankrác – Ryšánka: construction began 21 April 2022')
  await expect(detail).toContainText('Ryšánka – Nové Dvory: construction began 19 June 2026')
  await expect(detail.locator('a')).toHaveCount(2)
  await expect(detail.locator('a').nth(1)).toHaveAttribute('href', /dpp\.cz/)
  expect(await seen(page)).toEqual([
    { action: 'line_d_detail', station: 'rysanka', sections: ['Pankrác – Ryšánka', 'Ryšánka – Nové Dvory'] },
  ])
  // before the second start, Ryšánka's detail lists only the first section
  await page.evaluate(`render('2025-01-01')`)
  await expect(detail).toContainText('Pankrác – Ryšánka')
  await expect(detail).not.toContainText('Nové Dvory')
  await page.evaluate(`render(TODAY)`)
  await page.locator('#detailPanel').scrollIntoViewIfNeeded()
  await shot(page, 'picks-line-d-detail-390')
})

// Věra reads Czech, not English: she taps "Česky" and gets the same facts in Czech.
test('Věra (390px): the Czech section carries the same facts, marked lang="cs"', async ({ page }) => {
  await page.goto('/')
  await actions(page)
  const link = page.locator('#csLink')
  await expect(link).toBeVisible()
  const lb = (await link.boundingBox())!
  expect(lb.height).toBeGreaterThanOrEqual(44)
  await link.click()
  const cs = page.locator('#history-cs')
  await expect(cs).toHaveAttribute('lang', 'cs')
  await expect(cs).toBeInViewport()
  await expect(cs).toContainText('9. května 1974')
  await expect(cs).toContainText('58 stanic')
  await expect(cs).toContainText('21. dubna 2022')
  await expect(cs).toContainText('19. června 2026')
  await expect(cs).toContainText('2032')
  await expect.poll(() => seen(page)).toEqual([{ action: 'czech_section_view', via: 'link' }])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await shot(page, 'picks-czech-390')
})

test('reading down to the Czech section counts as a scroll view, once', async ({ page }) => {
  await page.goto('/')
  await actions(page)
  await page.locator('#history-cs').scrollIntoViewIfNeeded()
  await page.locator('#history-cs table').first().scrollIntoViewIfNeeded()
  await expect.poll(() => seen(page)).toEqual([{ action: 'czech_section_view', via: 'scroll' }])
})
