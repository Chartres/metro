import { defineConfig } from 'vitest/config'

// Served at the custom domain root https://metro.dravec.org/
export default defineConfig({
  base: '/',
  build: { outDir: 'dist' },
  test: { include: ['src/**/*.test.ts'] }, // e2e/ belongs to Playwright
})
