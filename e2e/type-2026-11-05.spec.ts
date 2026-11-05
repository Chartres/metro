// Visual signature, approved by Pavol on 2026-11-05 (docs/SIGNATURE.md): station names and the
// date are set in a grotesque close to Jiří Rathouský's Metron (the 1970s metro signage face),
// self-hosted under the OFL; every size on the page is one of taste.md's four steps.
import { expect, test, type Page } from '@playwright/test'

const FAMILY = 'Metro Sign Sans'
const SIGN = new RegExp(`^"?${FAMILY}"?,`)
const STEPS = [13, 17, 20, 28]

const familyOf = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontFamily)

test('the font is ours: same origin, OFL text shipped, inside the 60 KB budget, no font CDN', async ({ page, request }) => {
  const fontReqs: string[] = []
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontReqs.push(r.url())
  })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect(fontReqs.length).toBeGreaterThan(0)
  for (const u of fontReqs) expect(new URL(u).origin).toBe(new URL(page.url()).origin)
  const html = await page.content()
  expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.bunny/)
  const woff = await request.get('/fonts/metro-sign-sans.woff2')
  expect(woff.status()).toBe(200)
  expect((await woff.body()).length).toBeLessThanOrEqual(60 * 1024)
  const ofl = await request.get('/fonts/OFL.txt')
  expect(await ofl.text()).toContain('SIL Open Font License')
  // loaded and usable, with font-display: swap so text never waits for it
  expect(await page.evaluate((f) => document.fonts.check(`17px "${f}"`), FAMILY)).toBe(true)
  expect(html).toMatch(/font-display:\s*swap/)
})

test('every Czech letter in a station name is drawn by the font, not a fallback', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((f) => document.fonts.load(`600 17px "${f}"`, 'ůřěščžťďňÚŘŠČŽáíéýó'), FAMILY)
  // a glyph the font lacks falls through to the fallback: then it measures exactly as the fallback
  // alone does, under both fallbacks. (Comparing serif with monospace instead can pass falsely
  // when both resolve to the same system font.)
  const missing = await page.evaluate((f) => {
    // S is a top-level const in the page's classic script, so read it by name, not off window
    const names: string[] = (0, eval)('Object.values(S).map((s) => s.name + (s.former || ""))')
    const all = [...new Set(names.join('').replace(/\s/g, '') + '0123456789')]
    const c = document.createElement('canvas').getContext('2d')!
    const w = (font: string, ch: string) => ((c.font = font), c.measureText(ch).width)
    const falls = (ch: string, fb: string) => w(`600 40px "${f}", ${fb}`, ch) === w(`600 40px ${fb}`, ch)
    return all.filter((ch) => falls(ch, 'serif') && falls(ch, 'monospace'))
  }, FAMILY)
  expect(missing).toEqual([])
  // and the probe does catch a glyph the font lacks (CJK is not in the subset)
  const probe = await page.evaluate((f) => {
    const c = document.createElement('canvas').getContext('2d')!
    const w = (font: string) => ((c.font = font), c.measureText('漢').width)
    return w(`600 40px "${f}", serif`) === w('600 40px serif') && w(`600 40px "${f}", monospace`) === w('600 40px monospace')
  }, FAMILY)
  expect(probe).toBe(true)
})

test('station names and the date use the signage face; prose does not', async ({ page }) => {
  await page.goto('/?date=1988-10-26&station=dejvicka')
  for (const sel of ['#dateLabel', '#detailPanel h3', '.station text', '.myear', '#stations tbody th', '#stations .d',
    '#openings td:nth-child(3)', '#stations td:nth-child(4)']) {
    expect(await familyOf(page, sel), sel).toMatch(SIGN)
  }
  for (const sel of ['#history p', '#detailPanel .kv']) {
    expect(await familyOf(page, sel), sel).not.toMatch(SIGN)
  }
  await page.locator('.station[data-id="muzeum"]').dispatchEvent('mouseenter')
  expect(await familyOf(page, '#tooltip b')).toMatch(SIGN)
  expect(await page.locator('#tooltip b').evaluate((el) => getComputedStyle(el).fontSize)).toBe('17px')
})

for (const vp of [
  { name: '390px', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
]) {
  test(`four type steps and nothing under 13 px (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('/?date=1988-10-26&station=dejvicka')
    await page.locator('#history details').evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)))
    // every element that renders its own text, outside the map's SVG (labels there scale with the map)
    const sizes = await page.evaluate(() => {
      const out: Record<string, string> = {}
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('svg') || el.closest('script,style,noscript,option')) continue
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
        if (!own) continue
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden') continue
        const px = parseFloat(cs.fontSize)
        const key = `${px}`
        if (!out[key]) out[key] = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}`
      }
      return out
    })
    const off = Object.entries(sizes).filter(([px]) => !STEPS.includes(Number(px)))
    expect(off, `sizes off the four steps: ${JSON.stringify(off)}`).toEqual([])
    // the elements empty at load, and the select, which the walk above can't see
    for (const sel of ['#eventBanner', '#tooltip', '#speed']) {
      const px = await page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      expect(STEPS, sel).toContain(px)
    }
    // the speed select is a 44 px touch target
    expect((await page.locator('#speed').boundingBox())!.height).toBeGreaterThanOrEqual(44)
  })
}

test('the colour-scheme preference does not change the page: the dark ground is the design', async ({ browser }) => {
  const bgs: string[] = []
  for (const colorScheme of ['dark', 'light'] as const) {
    const ctx = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 } })
    const p = await ctx.newPage()
    await p.goto('/')
    bgs.push(await p.evaluate(() => getComputedStyle(document.body).backgroundColor))
    expect(await p.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await ctx.close()
  }
  expect(bgs[0]).toBe(bgs[1])
})

test('the wider date face never moves the slider: the label is as wide in May as in September', async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const at = async (d: string) => {
      await page.evaluate(`onSliderInput(false, '${d}')`)
      return {
        label: (await page.locator('#dateLabel').boundingBox())!.width,
        slider: (await page.locator('#slider').boundingBox())!.x,
        text: await page.locator('#dateLabel').textContent(),
      }
    }
    const may = await at('2015-05-01')
    const sep = await at('2015-09-01')
    expect(sep.text).toBe('September 2015')
    expect(sep.label).toBe(may.label)
    expect(sep.slider).toBe(may.slider)
  }
})
