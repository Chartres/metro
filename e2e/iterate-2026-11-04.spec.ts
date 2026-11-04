// Iterate round of 4 Nov 2026 (docs/SIGNATURE.md, decision log): the openings table names its
// sources, line by line, and says where they disagree; every station is listed with its opening
// date and former name, readable without JavaScript. Held to the map's data. On a 390 px phone.
import { expect, test, type Page } from '@playwright/test'

const SHOT_DIR = process.env.UPDATE_SHOTS ? 'e2e/shots' : 'test-results/shots'
test.use({ viewport: { width: 390, height: 844 } })

type Row = { name: string; lines: string; opened: string; former: string }
const rowsOf = (page: Page, id: string) =>
  page.locator(`#${id} tbody tr`).evaluateAll((trs) =>
    trs.map((tr) => {
      const td = [...tr.children].map((c) => c.textContent!.replace(/\s+/g, ' ').trim())
      return { name: td[0], lines: td[1], opened: td[2], former: td[3] }
    }),
  ) as Promise<Row[]>

// What the map's data says, in each language's date format: one row per drawn, open station,
// in Czech alphabetical order; an interchange gives each line's date, oldest first.
const expected = (page: Page, lang: 'en' | 'cs') =>
  page.evaluate(`(() => {
    // a fixed month table: ICU versions differ on September ("Sep" vs "Sept")
    const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const day = (d) => ${JSON.stringify(lang)} === 'en'
      ? (+d.slice(8)) + ' ' + MON[+d.slice(5, 7) - 1] + ' ' + d.slice(0, 4)
      : (+d.slice(8)) + '. ' + (+d.slice(5, 7)) + '. ' + d.slice(0, 4)
    return Object.values(S)
      .filter((s) => !isLineD(s))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'))
      .map((s) => {
        const per = s.lines.map((l) => [l, OPEN[l][s.id]]).sort((a, b) => a[1].localeCompare(b[1]))
        return {
          name: s.name,
          lines: per.map(([l]) => l).join(', '),
          opened: per.length === 1 ? day(per[0][1]) : per.map(([l, d]) => l + ': ' + day(d)).join('; '),
          former: s.former ?? '',
        }
      })
  })()`) as Promise<Row[]>

test('every station: its line, opening date and former name, in EN and CS, as in the data', async ({ page }) => {
  await page.goto('/')
  const total = (await page.evaluate('stationsOpenOn(TODAY)')) as number
  expect(total).toBe(58)
  const en = await rowsOf(page, 'stations')
  const cs = await rowsOf(page, 'stations-cs')
  expect(en).toHaveLength(total)
  expect(en).toEqual(await expected(page, 'en'))
  expect(cs).toEqual(await expected(page, 'cs'))
  // spot checks a reader would make
  expect(en.find((r) => r.name === 'Dejvická')).toEqual({ name: 'Dejvická', lines: 'A', opened: '12 Aug 1978', former: 'Leninova' })
  expect(en.find((r) => r.name === 'Muzeum')!.opened).toBe('C: 9 May 1974; A: 12 Aug 1978')
  // the station's name as DPP and Wikipedia write it, with spaces (the map had "I.P.Pavlova" until 4 Nov)
  expect(await page.evaluate(`S.ip_pavlova.name`)).toBe('I. P. Pavlova')
  await expect(page.locator('#fixes > li').first()).toHaveAttribute('data-fact', 'ip-pavlova-name')
  await expect(page.locator('#fixes-cs > li').first()).toHaveAttribute('data-fact', 'ip-pavlova-name')
  expect(cs.find((r) => r.name === 'Florenc')).toEqual({
    name: 'Florenc', lines: 'C, B', opened: 'C: 9. 5. 1974; B: 2. 11. 1985', former: 'Sokolovská',
  })
})

// Hana, whose grandfather worked on line C, wants to know where the dates come from, and
// notices that two sources give different days for Háje.
test('Hana (390px): the openings tables cite a source per line and name the 1980 disagreement', async ({ page }) => {
  await page.goto('/')
  for (const id of ['openings-sources', 'openings-sources-cs']) {
    const p = page.locator(`#${id}`)
    // right under its openings table
    expect(await p.evaluate((el) => el.previousElementSibling?.id)).toBe(id === 'openings-sources' ? 'openings' : 'openings-cs')
    const hrefs = await p.locator('a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
    expect(hrefs).toEqual([
      'https://en.wikipedia.org/wiki/Line_A_(Prague_Metro)',
      'https://en.wikipedia.org/wiki/Line_B_(Prague_Metro)',
      'https://cs.wikipedia.org/wiki/C_(linka_metra_v_Praze)',
      'https://en.wikipedia.org/wiki/H%C3%A1je_(Prague_Metro)',
    ])
  }
  // the date the map uses for Kačerov – Háje, and the one it does not
  expect(await page.evaluate(`OPEN.C.haje`)).toBe('1980-11-07')
  await expect(page.locator('#openings-sources')).toContainText('7 November 1980')
  await expect(page.locator('#openings-sources')).toContainText('11 November 1980')
  await expect(page.locator('#openings-sources-cs')).toContainText('7. listopadu 1980')
  await expect(page.locator('#openings-sources-cs')).toContainText('11. listopadu 1980')
  // the cited Czech line C article disagrees with itself twice (table vs text); the page says so
  for (const d of ['7 November 1984', '3 November 1984', '25 June 2004', '26 June 2004'])
    await expect(page.locator('#openings-sources')).toContainText(d)
  for (const d of ['7. listopadu 1984', '3. listopadu 1984', '25. června 2004', '26. června 2004'])
    await expect(page.locator('#openings-sources-cs')).toContainText(d)
  expect(await page.evaluate(`[OPEN.C.vltavska, OPEN.C.ladvi]`)).toEqual(['1984-11-03', '2004-06-26'])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

// Ondřej uses a screen reader and lives near Hůrka; he opens the station list on his phone.
test('Ondřej (390px): the station list opens from a summary, fits the screen, and is labelled', async ({ page }) => {
  await page.goto('/')
  const det = page.locator('#stations-list')
  const summary = det.locator('summary')
  await expect(summary).toHaveText('All 58 stations, A–Z')
  await expect(page.locator('#stations-list-cs summary')).toHaveText('Všech 58 stanic od A do Z')
  await summary.scrollIntoViewIfNeeded()
  expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await expect(page.locator('#stations')).toBeHidden()
  await summary.click()
  await expect(page.locator('#stations')).toBeVisible()
  await expect(page.locator('#stations caption')).toHaveText(/opening date and name until 1990/)
  // a date is never split across lines (one line of 13 px text is under 30 px tall)
  const heights = await page.locator('#stations .d').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
  expect(heights.length).toBeGreaterThanOrEqual(58)
  for (const h of heights) expect(h).toBeLessThan(30)
  // no word is broken across lines: each word of a name or former name sits on one line box
  const broken = await page.locator('#stations tbody').evaluate((tb) => {
    const out: string[] = []
    for (const cell of tb.querySelectorAll('th, td:nth-child(4)')) {
      const node = cell.firstChild
      if (!node || node.nodeType !== Node.TEXT_NODE) continue
      const text = node.textContent!
      let i = 0
      for (const word of text.split(' ')) {
        const r = document.createRange()
        r.setStart(node, i)
        r.setEnd(node, i + word.length)
        const tops = new Set([...r.getClientRects()].map((q) => Math.round(q.top)))
        if (tops.size > 1) out.push(word)
        i += word.length + 1
      }
    }
    return out
  })
  expect(broken).toEqual([])
  // each station name is its row's header, for screen readers moving along the row
  expect(await page.locator('#stations tbody th[scope="row"]').count()).toBe(58)
  expect(await page.locator('#stations-cs tbody th[scope="row"]').count()).toBe(58)
  const row = page.locator('#stations tbody tr', { hasText: 'Hůrka' })
  await expect(row).toContainText('11 Nov 1994')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.locator('#stations-list summary').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: `${SHOT_DIR}/iterate-stations-390.png` })
  await page.locator('#openings').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: `${SHOT_DIR}/iterate-openings-sources-390.png` })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('crawlers get the full station list in both languages', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#stations tbody tr')).toHaveCount(58)
    await expect(page.locator('#stations-cs tbody tr')).toHaveCount(58)
    expect(await page.locator('#stations').textContent()).toContain('Gottwaldova')
    expect(await page.locator('#openings-sources').textContent()).toContain('Wikipedia')
  })
})
