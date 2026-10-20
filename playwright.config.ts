import { defineConfig, devices } from '@playwright/test'

// Never reuse a server already on the port: parallel agents' previews of other
// repos sit there. PW_PORT picks another port; --strictPort fails instead of drifting.
const port = Number(process.env.PW_PORT ?? 4173)

export default defineConfig({
  testDir: './e2e',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Sandboxes with a system Chromium and no playwright-managed download:
        // PW_CHROMIUM=/path/to/chromium npx playwright test
        ...(process.env.PW_CHROMIUM
          ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } }
          : {}),
      },
    },
  ],
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    port,
    reuseExistingServer: false,
  },
})
