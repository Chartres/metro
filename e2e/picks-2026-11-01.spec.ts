// Pavol's picks of 1 Nov 2026 (docs/SIGNATURE.md, decision log), one persona journey each,
// on a 390 px phone: date links, the correction log, and the Line D sources under the Line D text.
import { expect, test, type Page } from '@playwright/test'

const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
const shot = async (page: Page, name: string) => {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
  )
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false })
}
// listen before the page's own scripts run: link_opened fires during boot
const actionsFromBoot = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { seen: Record<string, unknown>[] }
    w.seen = []
    document.addEventListener('metro:action', (e) => w.seen.push((e as CustomEvent).detail))
  })
const seen = (page: Page) =>
  page.evaluate(() => (window as unknown as { seen: Record<string, unknown>[] }).seen)
const linkOpened = async (page: Page) => (await seen(page)).filter((d) => d.action === 'link_opened')

test.use({ viewport: { width: 390, height: 844 } })

// Petr, a history teacher, posts a link to the day line B reached Nové Butovice, with Dejvická
// selected, so his class sees "Leninova" on the map as it was. Then he copies a link of his own.
test('Petr (390px): a date link opens that day with the station selected, and copy link round-trips', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await actionsFromBoot(page)
  await page.goto('/?date=1988-10-26&station=dejvicka')
  await expect(page.locator('#dateLabel')).toHaveText('October 1988')
  expect(await page.evaluate('currentDate')).toBe('1988-10-26')
  await expect(page.locator('#statStations')).toHaveText(String(await page.evaluate(`stationsOpenOn('1988-10-26')`)))
  await expect(page.locator('#statLines')).toHaveText('3')
  const detail = page.locator('#detailPanel')
  await expect(detail).toBeVisible()
  await expect(detail.locator('h3')).toHaveText('Leninova')
  await expect(page.locator('.station[data-id="dejvicka"]')).toHaveAttribute('aria-label', 'Leninova')
  await expect.poll(() => linkOpened(page)).toEqual([
    { action: 'link_opened', date: '1988-10-26', station: 'dejvicka', fallback: false },
  ])

  const copy = detail.getByRole('button', { name: 'Copy link to this day' })
  expect((await copy.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await copy.click()
  await expect(detail.locator('.copied')).toHaveText('Copied')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe(new URL('/?date=1988-10-26&station=dejvicka', page.url()).href)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.locator('#svg').scrollIntoViewIfNeeded()
  await shot(page, 'picks-date-link-390')

  // the copied link opens the same view in a fresh tab
  const again = await context.newPage()
  await again.goto(copied)
  await expect(again.locator('#dateLabel')).toHaveText('October 1988')
  await expect(again.locator('#detailPanel h3')).toHaveText('Leninova')
})

test('copy link follows the map: after moving to another day it links that day', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/?date=1988-10-26&station=dejvicka')
  await page.evaluate(`onSliderInput(false, '1995-03-01')`)
  await expect(page.locator('#detailPanel h3')).toHaveText('Dejvická')
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  await expect(page.locator('#detailPanel .copied')).toHaveText('Copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\?date=1995-03-01&station=dejvicka$/)
})

test('without a clipboard the link is shown to copy by hand', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  })
  await page.goto('/?date=2015-04-06&station=nemocnice_motol')
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  const out = page.locator('#detailPanel .linkout')
  await expect(out).toHaveValue(/\?date=2015-04-06&station=nemocnice_motol$/)
  // tapping again reuses the box instead of stacking another
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  await expect(out).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

// Broken, mistyped or old links still open the map, quietly on today.
for (const [query, station, why] of [
  ['?date=2026-02-30&station=dejvicka', 'dejvicka', 'a day that does not exist'],
  ['?date=1960-01-01&station=dejvicka', 'dejvicka', 'a date before opening day'],
  ['?date=2099-01-01', null, 'a date after today'],
  ['?date=yesterday&station=nope', null, 'garbage in both'],
  ['?station=libus', null, 'a Line D station the map does not draw'],
] as const) {
  test(`date link with ${why} falls back to today without an error`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await actionsFromBoot(page)
    await page.goto('/' + query)
    const today = (await page.evaluate('TODAY')) as string
    expect(await page.evaluate('currentDate')).toBe(today)
    await expect(page.locator('#statStations')).toHaveText('58')
    if (station) {
      await expect(page.locator('#detailPanel h3')).toHaveText('Dejvická')
    } else {
      await expect(page.locator('#eventsList')).toBeVisible()
      await expect(page.locator('#detailPanel')).toBeHidden()
    }
    await expect.poll(() => linkOpened(page)).toEqual([{ action: 'link_opened', date: today, station, fallback: true }])
    expect(errors).toEqual([])
  })
}

test('a link to a Line D station reports link_opened, then line_d_detail', async ({ page }) => {
  await actionsFromBoot(page)
  await page.goto('/?date=2026-07-01&station=rysanka')
  await expect(page.locator('#detailPanel')).toContainText('Ryšánka – Nové Dvory: construction began 19 June 2026')
  await expect.poll(() => seen(page)).toEqual([
    { action: 'link_opened', date: '2026-07-01', station: 'rysanka', fallback: false },
    { action: 'line_d_detail', station: 'rysanka', sections: ['Pankrác – Ryšánka', 'Ryšánka – Nové Dvory'] },
  ])
})

test('a "Copied" note survives Play re-rendering the panel', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/?date=1974-05-09&station=muzeum')
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  await expect(page.locator('#detailPanel .copied')).toHaveText('Copied')
  await page.evaluate(`onSliderInput(false, '1975-01-01')`) // same station, same text: panel kept
  await expect(page.locator('#detailPanel .copied')).toHaveText('Copied')
})

test('a plain visit reports no link_opened', async ({ page }) => {
  await actionsFromBoot(page)
  await page.goto('/')
  await page.waitForLoadState('load')
  expect(await linkOpened(page)).toEqual([])
})

// Martin, who once quoted the old Line D date in a forum, checks what changed and why.
test('Martin (390px): the correction log lists what was wrong, what is right, and a source, in EN and CS', async ({
  page,
}) => {
  await page.goto('/')
  const fixes = page.locator('#fixes > li')
  const fixesCs = page.locator('#fixes-cs > li')
  expect(await fixes.count()).toBeGreaterThanOrEqual(1)
  // the first entry is founder case 2's date error: the Line D start, wrong 1 Mar 2022, right as in the data
  const first = fixes.first()
  await expect(first).toHaveAttribute('data-fact', 'line-d-start')
  await expect(first).toContainText('1 March 2022')
  const dStart = (await page.evaluate('D_SECTIONS[0].start')) as string
  expect(dStart).toBe('2022-04-21')
  await expect(first).toContainText(await page.evaluate(`fmtDay(D_SECTIONS[0].start)`))
  await expect(fixesCs.first()).toContainText('1. března 2022')
  await expect(fixesCs.first()).toContainText('21. dubna 2022')
  // every entry: a date, a source link; dated oldest first; the same entries in both languages
  const rows = (loc: typeof fixes) =>
    loc.evaluateAll((els) =>
      els.map((li) => ({
        date: (li as HTMLElement).dataset.date,
        fact: (li as HTMLElement).dataset.fact,
        time: li.querySelector('time')?.getAttribute('datetime'),
        sources: [...li.querySelectorAll('a')].map((a) => a.href),
      })),
    )
  const en = await rows(fixes)
  const cs = await rows(fixesCs)
  expect(cs).toEqual(en)
  for (const r of en) {
    expect(r.time).toBe(r.date)
    expect(r.sources.length).toBeGreaterThan(0)
    for (const s of r.sources) expect(s).toMatch(/^https:\/\//)
  }
  const dates = en.map((r) => r.date!)
  expect(dates).toEqual([...dates].sort())
  await expect(page.locator('#history-cs')).toContainText('Opravy')

  const heading = page.locator('#corrections')
  await heading.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await shot(page, 'picks-corrections-390')
})

// Tomáš wants the two Line D dates' sources in the text itself, not only behind a station tap.
test('Tomáš (390px): the Line D paragraph cites both start dates, in EN and CS, from the same data', async ({
  page,
}) => {
  await page.goto('/')
  const want = (await page.evaluate(`D_SECTIONS.map((s) => s.sources[0].url)`)) as string[]
  expect(want).toHaveLength(2)
  expect(want[0]).toMatch(/archiweb\.cz/) // ČTK, 21 Apr 2022
  expect(want[1]).toMatch(/ceskatelevize\.cz/) // ČT24, 19 Jun 2026
  for (const id of ['#line-d-sources', '#line-d-sources-cs']) {
    const p = page.locator(id)
    // right under the Line D paragraph
    const prevIsLineD = await p.evaluate((el) => /Line D|Trasa D/.test(el.previousElementSibling?.previousElementSibling?.textContent ?? ''))
    expect(prevIsLineD).toBe(true)
    expect(await p.locator('a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))).toEqual(want)
  }
  await expect(page.locator('#line-d-sources')).toContainText('21 April 2022')
  await expect(page.locator('#line-d-sources')).toContainText('19 June 2026')
  await expect(page.locator('#line-d-sources-cs')).toContainText('21. dubna 2022')
  await expect(page.locator('#line-d-sources-cs')).toContainText('19. června 2026')
  await expect(page.locator('#line-d-sources-cs')).toContainText('ČTK')
  await expect(page.locator('#line-d-sources-cs')).toContainText('ČT24')
  await page.locator('#line-d-sources').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, 200))
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await shot(page, 'picks-line-d-sources-390')
})
