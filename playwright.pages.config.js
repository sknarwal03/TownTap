import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: './production-tests',
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4173/TownTap/',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined) },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --base=/TownTap/ --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/TownTap/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
