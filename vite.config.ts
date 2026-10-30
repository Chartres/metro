import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// The "Today" small multiple shows the network on the day the site was built: the data only
// changes with a build. Prague's calendar date, so a build just after midnight UTC isn't a day off.
export const buildDate = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague' }).format(now)

const stampBuildDate = (): Plugin => ({
  name: 'metro-build-date',
  transformIndexHtml: (html) => html.replaceAll('__BUILD_DATE__', buildDate()),
})

// Served at the custom domain root https://metro.dravec.org/
export default defineConfig({
  base: '/',
  plugins: [stampBuildDate()],
  build: { outDir: 'dist' },
  test: { include: ['src/**/*.test.ts'] }, // e2e/ belongs to Playwright
})
