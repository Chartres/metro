// Pavol's picks of 1 Nov 2026, second round (docs/SIGNATURE.md, decision log): the correction log
// backfilled with the 17 Oct fixes and run newest first, and copied links counted as key_action
// link_copied {date, station}. On a 390 px phone.
import { expect, test, type Page } from '@playwright/test'

const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
const listen = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { seen: Record<string, unknown>[] }
    w.seen = []
    document.addEventListener('metro:action', (e) => w.seen.push((e as CustomEvent).detail))
  })
const copied = async (page: Page) =>
  (await page.evaluate(() => (window as unknown as { seen: Record<string, unknown>[] }).seen)).filter(
    (d) => d.action === 'link_copied',
  )

test.use({ viewport: { width: 390, height: 844 } })

// Jana remembers Skalka opening in November 1990 from an old version of the map and wants to see
// that the date was wrong, when it was fixed, and where the right one comes from.
test('Jana (390px): the 17 Oct fixes are in the log, dated, sourced, under the later entries', async ({ page }) => {
  await page.goto('/')
  const facts = (id: string) =>
    page.locator(`#${id} > li`).evaluateAll((els) => els.map((li) => (li as HTMLElement).dataset.fact))
  const want = [
    'ip-pavlova-name', // 4 Nov
    'line-a-1978',
    'line-d-start',
    'line-d-stations',
    'line-d-opening',
    'line-b-order',
    'line-a-1987-1990',
    'line-b-1985',
  ]
  expect(await facts('fixes')).toEqual(want)
  expect(await facts('fixes-cs')).toEqual(want)

  for (const fact of ['line-b-order', 'line-a-1987-1990', 'line-b-1985']) {
    for (const [id, day] of [
      ['fixes', '17 October 2026'],
      ['fixes-cs', '17. října 2026'],
    ]) {
      const li = page.locator(`#${id} > li[data-fact="${fact}"]`)
      await expect(li).toHaveAttribute('data-date', '2026-10-17')
      await expect(li.locator('time')).toHaveText(day)
      expect(await li.locator('a[href^="https://en.wikipedia.org/wiki/Line_"]').count()).toBe(1)
    }
  }

  // each "it is now" matches the map's data
  const en = (fact: string) => page.locator(`#fixes > li[data-fact="${fact}"]`)
  const cs = (fact: string) => page.locator(`#fixes-cs > li[data-fact="${fact}"]`)
  const nameOf = (id: string) => page.evaluate(`S['${id}'].name`) as Promise<string>
  const order = (await page.evaluate(`LINE_ORDER.B.slice(
    LINE_ORDER.B.indexOf('nove_butovice'), LINE_ORDER.B.indexOf('andel') + 1)`)) as string[]
  const names = (await Promise.all(order.map(nameOf))).join(', ')
  expect(names).toBe('Nové Butovice, Jinonice, Radlická, Smíchovské nádraží, Anděl')
  await expect(en('line-b-order')).toContainText(`It is ${names}.`)
  await expect(cs('line-b-order')).toContainText(`Správně je ${names}.`)

  expect(await page.evaluate(`OPEN.A.strasnicka`)).toBe('1987-07-11')
  expect(await page.evaluate(`OPEN.A.skalka`)).toBe('1990-07-04')
  await expect(en('line-a-1987-1990')).toContainText('11 November 1987 and 4 November 1990')
  await expect(en('line-a-1987-1990')).toContainText(
    `Strašnická opened on ${await page.evaluate(`fmtDay(OPEN.A.strasnicka)`)} and Skalka on ${await page.evaluate(`fmtDay(OPEN.A.skalka)`)}`,
  )
  await expect(cs('line-a-1987-1990')).toContainText('Strašnická byla otevřena 11. července 1987 a Skalka 4. července 1990')

  const ev = (await page.evaluate(`EVENTS.find((e) => e.date === '1985-11-02' && e.line === 'B').stations`)) as string[]
  expect(ev).toHaveLength(7)
  const evNames = await Promise.all(
    ['florenc', 'namesti_republiky', 'mustek', 'narodni_trida', 'karlovo_namesti', 'andel', 'smichovske_nadrazi'].map(
      async (id) => {
        expect(ev).toContain(id)
        return nameOf(id)
      },
    ),
  )
  await expect(en('line-b-1985')).toContainText(evNames.join(', '))
  // Florenc and Můstek were already open on lines C and A: 5 new, as the openings table says
  expect(await page.evaluate(`OPEN.C.florenc < '1985-11-02' && OPEN.A.mustek < '1985-11-02'`)).toBe(true)
  await expect(page.locator('tr[data-date="1985-11-02"]').first().locator('td').last()).toHaveText('5')
  await expect(en('line-b-1985')).toContainText('Five were new')
  await expect(cs('line-b-1985')).toContainText('Nových bylo pět')
  await expect(cs('line-b-1985')).toContainText(evNames.join(', '))

  // the old pointer to the changelog for the 17 Oct fixes is gone: they are listed now
  await expect(page.locator('#fixes + p.src')).toContainText('Every release is in the changelog.')
  await expect(page.locator('#fixes-cs + p.src')).toContainText('Všechna vydání jsou v changelogu.')
  await expect(page.locator('#history')).not.toContainText('before this log started')
  await expect(page.locator('#history-cs')).not.toContainText('z doby před tímto přehledem')

  // the shot: the last 27 Oct entry, then the three backfilled 17 Oct entries
  await en('line-d-opening').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: `${SHOT_DIR}/picks-corrections-backfilled-390.png` })
})

// Eva copies links to two different days for a quiz sheet; each copy is counted once, with the
// day and station she copied.
test('Eva (390px): each copy is reported once as link_copied {date, station}', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await listen(page)
  await page.goto('/?date=1988-10-26&station=dejvicka')
  const copy = page.getByRole('button', { name: 'Copy link to this day' })
  await copy.click()
  await expect(page.locator('#detailPanel .copied')).toHaveText('Copied')
  expect(await copied(page)).toEqual([{ action: 'link_copied', date: '1988-10-26', station: 'dejvicka' }])

  await page.evaluate(`onSliderInput(false, '1995-03-01')`)
  await copy.click()
  await expect.poll(() => copied(page)).toEqual([
    { action: 'link_copied', date: '1988-10-26', station: 'dejvicka' },
    { action: 'link_copied', date: '1995-03-01', station: 'dejvicka' },
  ])
  // no other action rides along with a copy
  const all = (await page.evaluate(() => (window as unknown as { seen: { action: string }[] }).seen)).map(
    (d) => d.action,
  )
  expect(all).toEqual(['link_opened', 'link_copied', 'link_copied'])
})

test('without a clipboard a press still counts once (the link is shown to copy by hand)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  })
  await listen(page)
  await page.goto('/?date=2015-04-06&station=nemocnice_motol')
  await page.getByRole('button', { name: 'Copy link to this day' }).click()
  await expect(page.locator('#detailPanel .linkout')).toHaveValue(/\?date=2015-04-06&station=nemocnice_motol$/)
  expect(await copied(page)).toEqual([{ action: 'link_copied', date: '2015-04-06', station: 'nemocnice_motol' }])
})
