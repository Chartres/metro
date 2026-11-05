// Before/after screenshots for the type change (2026-11-05): 390 px and desktop, light and dark
// colour-scheme preference. Usage: node scripts/type-shots.cjs <baseURL> <prefix>
const { chromium } = require('playwright')
;(async () => {
  const [base, prefix] = process.argv.slice(2)
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
  for (const scheme of ['dark', 'light']) {
    const phone = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: scheme })
    await phone.goto(base + '?date=1988-10-26&station=dejvicka')
    await phone.evaluate(() => document.fonts.ready)
    await phone.screenshot({ path: `e2e/shots/${prefix}-390-detail-${scheme}.png` })
    await phone.locator('#sideTabs button').first().click()
    await phone.locator('#eventsList .ev').nth(3).scrollIntoViewIfNeeded()
    await phone.screenshot({ path: `e2e/shots/${prefix}-390-timeline-${scheme}.png` })
    const desk = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: scheme })
    await desk.goto(base + '?date=1988-10-26&station=dejvicka')
    await desk.evaluate(() => document.fonts.ready)
    await desk.screenshot({ path: `e2e/shots/${prefix}-desktop-${scheme}.png` })
  }
  await b.close()
})()
