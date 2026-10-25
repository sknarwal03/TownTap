import { test, expect } from '@playwright/test';

test('production app renders on the repository path with working PWA assets', async ({ page }) => {
  const crashes = [];
  const failedAssets = [];
  page.on('pageerror', error => crashes.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && ['script', 'stylesheet', 'image', 'manifest'].includes(response.request().resourceType())) {
      failedAssets.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto('./');
  expect(response.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveText('Welcome');
  await expect(page.locator('[role=status]')).toContainText('Firebase is not configured');
  // This is a frontend-only build: no phone login or emulator connection is advertised.
  await expect(page.locator('#phoneForm')).toHaveCount(0);
  const scriptPaths = await page.locator('script[src]').evaluateAll(scripts => scripts.map(script => new URL(script.src).pathname));
  expect(scriptPaths.some(path => path.startsWith('/TownTap/assets/'))).toBe(true);

  const manifestUrl = await page.locator('link[rel=manifest]').evaluate(link => link.href);
  expect(new URL(manifestUrl).pathname).toBe('/TownTap/manifest.webmanifest');
  const manifestResponse = await page.request.get(manifestUrl);
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  for (const key of ['id', 'start_url', 'scope']) {
    expect(new URL(manifest[key], manifestUrl).pathname).toBe('/TownTap/');
  }
  const iconUrl = new URL(manifest.icons[0].src, manifestUrl).href;
  expect(new URL(iconUrl).pathname).toBe('/TownTap/icon.svg');
  expect((await page.request.get(iconUrl)).status()).toBe(200);

  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return { scope: registration.scope, script: registration.active.scriptURL };
  });
  expect(new URL(worker.scope).pathname).toBe('/TownTap/');
  expect(new URL(worker.script).pathname).toBe('/TownTap/service-worker.js');
  await page.goto('./#/settings');
  await expect(page.locator('main h1')).toHaveText('Settings');
  await page.locator('[data-locale=hi]').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(crashes).toEqual([]);
  expect(failedAssets).toEqual([]);
});
