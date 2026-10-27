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
  // the Czech summary is marked as Czech for search engines and screen readers
  await expect(page.locator('#history [lang="cs"]')).toContainText('Leninova')
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
    const want = await page.evaluate(`EVENTS.filter((e) => ['A', 'B', 'C'].includes(e.tag) && e.stations)
      .map((e) => [e.date, e.line, String(e.stations.length)])`)
    const got = await page.locator('#openings tbody tr').evaluateAll((rows) =>
      rows.map((r) => [r.getAttribute('data-date'), r.children[1].textContent!.trim(), r.children[3].textContent!.trim()]),
    )
    expect(got).toEqual(want)
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

  test('the history text sits below the map, not in front of it', async ({ page }) => {
    await page.goto('/')
    const app = (await page.locator('#app').boundingBox())!
    const hist = (await page.locator('#history').boundingBox())!
    expect(hist.y).toBeGreaterThanOrEqual(app.y + app.height - 1)
  })
})
