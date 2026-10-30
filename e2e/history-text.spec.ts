// The static history text is what search engines and AI crawlers read (most don't run JS).
// It is written by hand, so these tests hold it to the map's data: if one changes, both must.
import { expect, test } from '@playwright/test'

test.use({ javaScriptEnabled: false })

test('without JavaScript the page still answers the common questions', async ({ page }) => {
  await page.goto('/')
  const text = (await page.locator('#history').textContent()) ?? ''
  expect(text).toContain('9 May 1974')
  expect(text).toContain('Leninova')
  expect(text).toContain('2032')
  await expect(page.locator('#history h2').first()).toBeVisible()
  // the Czech section is marked as Czech for search engines and screen readers, and reads without JS
  await expect(page.locator('#history [lang="cs"]')).toContainText('Leninova')
  await expect(page.locator('#openings-cs tbody tr')).toHaveCount(18)
  // FAQ structured data parses and carries real answers
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  const faq = blocks.map((b) => JSON.parse(b)).find((b) => b['@type'] === 'FAQPage')
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4)
  for (const q of faq.mainEntity) expect(q.acceptedAnswer.text.length).toBeGreaterThan(40)
})

test.describe('with JavaScript', () => {
  test.use({ javaScriptEnabled: true })

  test('openings table matches the timeline events', async ({ page }) => {
    await page.goto('/')
    // "new stations" = stations first opened that day: an interchange counts once, on its first line
    const want = await page.evaluate(`EVENTS.filter((e) => ['A', 'B', 'C'].includes(e.tag) && e.stations)
      .map((e) => [e.date,
        new Date(e.date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        e.line, String(Object.values(S).filter((s) => FIRST_OPEN[s.id] === e.date).length)])`)
    const got = await page.locator('#openings tbody tr').evaluateAll((rows) =>
      rows.map((r) => [r.getAttribute('data-date'), r.children[0].textContent!.trim(),
        r.children[1].textContent!.trim(), r.children[3].textContent!.trim()]),
    )
    expect(got).toEqual(want)
    // so the column adds up to today's total
    const total = await page.evaluate('stationsOpenOn(TODAY)')
    expect(got.reduce((n, r) => n + Number(r[3]), 0)).toBe(total)
  })

  test('prose and FAQ answers agree with the data', async ({ page }) => {
    await page.goto('/')
    const total = String(await page.evaluate('stationsOpenOn(TODAY)'))
    const pairs = (await page.evaluate(`Object.values(S).filter((s) => s.former).map((s) => s.former + ' → ' + s.name)`)) as string[]
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((b) => JSON.parse(b)).find((b) => b['@type'] === 'FAQPage')
    const answers = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text).join('\n')
    for (const p of pairs) expect(answers).toContain(p)
    expect(answers).toContain(`${total} stations`)
    expect(await page.locator('#history > p').first().textContent()).toContain(`${total} stations`)
    const dStart = await page.evaluate(
      `new Date(D_CONSTRUCTION_START + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })`,
    )
    expect(answers).toContain(dStart)
    expect(await page.locator('#history').textContent()).toContain(dStart)
  })

  test('rename table and Czech summary match the station data', async ({ page }) => {
    await page.goto('/')
    const want = (await page.evaluate(`Object.values(S).filter((s) => s.former).map((s) => [s.former, s.name])`)) as string[][]
    const got = await page.locator('#renames tbody tr').evaluateAll((rows) =>
      rows.map((r) => [r.children[0].textContent!.trim(), r.children[1].textContent!.trim()]),
    )
    expect([...got].sort()).toEqual([...want].sort())
    const cs = (await page.locator('#history [lang="cs"]').textContent()) ?? ''
    for (const [former, name] of want) expect(cs).toContain(`${former} → ${name}`)
    await expect(page.locator('#history')).toContainText(`${want.length} stations`)
  })

  test('the Czech section carries the same openings and renames as the data', async ({ page }) => {
    await page.goto('/')
    const want = await page.evaluate(`EVENTS.filter((e) => ['A', 'B', 'C'].includes(e.tag) && e.stations)
      .map((e) => { const [y, m, d] = e.date.split('-'); return [e.date, Number(d) + '. ' + Number(m) + '. ' + y,
        e.line, String(Object.values(S).filter((s) => FIRST_OPEN[s.id] === e.date).length)] })`)
    const got = await page.locator('#openings-cs tbody tr').evaluateAll((rows) =>
      rows.map((r) => [r.getAttribute('data-date'), r.children[0].textContent!.trim(),
        r.children[1].textContent!.trim(), r.children[3].textContent!.trim()]),
    )
    expect(got).toEqual(want)
    // the section column matches the English table row for row
    const en = await page.locator('#openings tbody tr td:nth-child(3)').allTextContents()
    const csSec = await page.locator('#openings-cs tbody tr td:nth-child(3)').allTextContents()
    expect(csSec.map((t) => t.replace(/ \(.*\)$/, ''))).toEqual(en.map((t) => t.replace(/ \(.*\)$/, '')))
    const renames = (await page.evaluate(`Object.values(S).filter((s) => s.former).map((s) => [s.former, s.name])`)) as string[][]
    const gotR = await page.locator('#renames-cs tbody tr').evaluateAll((rows) =>
      rows.map((r) => [r.children[0].textContent!.trim(), r.children[1].textContent!.trim()]),
    )
    expect([...gotR].sort()).toEqual([...renames].sort())
    const total = String(await page.evaluate('stationsOpenOn(TODAY)'))
    await expect(page.locator('#history-cs')).toContainText(`${total} stanic`)
    // Line D start dates, in Czech, from the data
    const months = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']
    for (const start of (await page.evaluate('D_SECTIONS.map((s) => s.start)')) as string[]) {
      const [y, m, d] = start.split('-')
      await expect(page.locator('#history-cs')).toContainText(`${Number(d)}. ${months[Number(m) - 1]} ${y}`)
    }
  })

  test('structured data: both languages, and the Czech FAQ answers are on the page', async ({ page }) => {
    await page.goto('/')
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b))
    const app = blocks.find((b) => b['@type'] === 'WebApplication')
    expect(app.inLanguage).toEqual(['en', 'cs'])
    const faq = blocks.find((b) => b['@type'] === 'FAQPage')
    const csQs = faq.mainEntity.filter((q: { inLanguage?: string }) => q.inLanguage === 'cs')
    expect(csQs.length).toBe(4)
    const csText = ((await page.locator('#history-cs').textContent()) ?? '').replace(/\s+/g, ' ')
    // every fact the Czech answers state is in the visible Czech section
    const facts = ['9. května 1974', '58 stanic', '22. února 1990', '6. dubna 2015', '21. dubna 2022',
      '19. června 2026', 've druhé polovině roku 2032']
    const answers = csQs.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text).join(' ')
    for (const f of facts) {
      expect(answers).toContain(f)
      expect(csText).toContain(f)
    }
    const pairs = (await page.evaluate(`Object.values(S).filter((s) => s.former).map((s) => s.former + ' → ' + s.name)`)) as string[]
    for (const p of pairs) expect(answers).toContain(p)
    // one page, one URL: the sitemap lists only the root, which carries both languages
    const sitemap = await (await page.request.get('/sitemap.xml')).text()
    expect(sitemap.match(/<loc>/g)?.length).toBe(1)
    expect(sitemap).toContain('<loc>https://metro.dravec.org/</loc>')
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute('content', 'cs_CZ')
  })

  test('the history text sits below the map, not in front of it', async ({ page }) => {
    await page.goto('/')
    const app = (await page.locator('#app').boundingBox())!
    const hist = (await page.locator('#history').boundingBox())!
    expect(hist.y).toBeGreaterThanOrEqual(app.y + app.height - 1)
  })
})
