import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';

const project = 'demo-towntap-local';
async function login(page, phone) {
  await page.goto('/#/welcome');
  await page.locator('[name=phone]').fill(phone);
  await page.locator('#phoneForm button').click();
  await expect(page.locator('#codeForm')).toBeVisible({ timeout: 20000 });
  const response = await page.request.get(`http://127.0.0.1:9099/emulator/v1/projects/${project}/verificationCodes`);
  const { verificationCodes } = await response.json();
  const code = verificationCodes.findLast(item => item.phoneNumber === phone).code;
  await page.locator('[name=code]').fill(code);
  await page.locator('#codeForm button').click();
  await expect(page.locator('[data-action=sign-out]')).toBeVisible();
}
async function saveProfile(page) {
  await page.locator('#profileForm button[type=submit]').click();
  await expect(page).toHaveURL(/my-cards/);
  await expect(page.locator('[data-action=edit-profile]').first()).toBeVisible();
}

test('OTP, cards, sharing, saved notes and restrictive privacy across accounts', async ({ browser, page }, info) => {
  const suffix = String(Date.now()).slice(-7);
  const viewerContext = await browser.newContext({ viewport: info.project.use.viewport });
  const viewer = await viewerContext.newPage();
  page.on('dialog', dialog => dialog.accept());
  try {
    await login(page, `+1555${suffix}`);
    await page.goto('/#/card-editor');
    await expect(page.locator('[name=visibility]')).toHaveValue('private');
    await page.locator('[name=displayName]').fill('Alpha Owner');
    await page.locator('[name=phone]').fill('+911234567890');
    await page.locator('[name=email]').fill('secret@example.test');
    await page.locator('[name=audience-phone]').selectOption('link');
    await saveProfile(page);
    await page.locator('[data-action=edit-profile]').first().click();
    await page.locator('[name=visibility]').selectOption('public');
    await page.locator('[name=audience-displayName]').selectOption('public');
    await saveProfile(page);
    await page.locator('[data-action=share-profile]').first().click();
    await expect(page.locator('#shareUrl')).toBeVisible();
    const url = await page.locator('#shareUrl').inputValue();
    const profileId = new URLSearchParams(url.split('?')[1]).get('profileId');
    await expect(page.locator('.qr-panel img')).toBeVisible();
    const pixels = await page.locator('.qr-panel img').evaluate(async image => {
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return { width: canvas.width, height: canvas.height, data: Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data) };
    });
    expect(jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data).toBe(url);
    await login(viewer, `+1666${suffix}`);
    await viewer.goto(url);
    await expect(viewer.locator('.data-card h2')).toHaveText('Alpha Owner');
    await expect(viewer.locator('a[href^="tel:"]')).toBeVisible();
    await expect(viewer.locator('.data-card')).not.toContainText('secret@example.test');
    await viewer.locator('[data-action=save-contact]').click();
    await expect(viewer.locator('[role=status]')).toContainText('Card saved.');
    await viewer.goto('/#/saved-contacts');
    await viewer.locator('[data-action=saved-detail]').click();
    await viewer.locator('[name=nickname]').fill('My electrician');
    await viewer.locator('[name=note]').fill('Met at market');
    await viewer.locator('[name=tags]').fill('repairs, local');
    await viewer.locator('#savedForm button[type=submit]').click();
    await expect(viewer.locator('[role=status]')).toContainText('Save private details');
    await viewer.goto('/#/saved-contacts');
    await viewer.locator('#savedSearch').fill('market');
    await expect(viewer.locator('.data-card')).toContainText('My electrician');
    await page.goto(`/#/card-editor?profileId=${profileId}`);
    await page.locator('[name=displayName]').fill('Alpha Updated');
    await saveProfile(page);
    await viewer.reload();
    await viewer.locator('[data-action=saved-detail]').click();
    await expect(viewer.locator('.data-card h2')).toHaveText('Alpha Updated');
    await page.goto(url);
    await expect(page.locator('[data-action=revoke-links]')).toBeVisible();
    await page.locator('[data-action=revoke-links]').click();
    await expect(page.locator('#shareUrl')).toHaveCount(0);
    await viewer.goto('/#/welcome');
    await viewer.goto(url);
    await expect(viewer.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(viewer.locator('.data-card h2')).toHaveText('Alpha Updated');
    await page.goto(`/#/card-editor?profileId=${profileId}`);
    await page.locator('[name=visibility]').selectOption('private');
    await saveProfile(page);
    await viewer.goto('/#/saved-contacts');
    await expect(viewer.locator('.data-card')).toContainText('My electrician');
    await expect(viewer.locator('.data-card')).not.toContainText('Alpha Updated');
    await viewer.locator('[data-action=saved-detail]').click();
    await expect(viewer.locator('[name=note]')).toHaveValue('Met at market');
    await viewer.locator('[data-action=remove-saved]').click();
    await expect(viewer.locator('#savedForm')).toHaveCount(0);
    await viewer.goto('/#/saved-contacts');
    await expect(viewer.locator('.data-card')).toHaveCount(0);
    await page.goto(`/#/card-editor?profileId=${profileId}`);
    await page.locator('[name=visibility]').selectOption('unlisted');
    await saveProfile(page);
    await page.locator('[data-action=share-profile]').first().click();
    await expect(page.locator('#shareUrl')).toBeVisible();
    const unlisted = await page.locator('#shareUrl').inputValue();
    await viewer.goto(unlisted);
    await expect(viewer.locator('.data-card h2')).toHaveText('Alpha Updated');
    await page.locator('[data-action=revoke-links]').click();
    await expect(page.locator('#shareUrl')).toHaveCount(0);
    await viewer.goto('/#/welcome');
    await viewer.goto(unlisted);
    await expect(viewer.locator('[role=alert]')).toContainText('Card unavailable');
    await expect(viewer.locator('.data-card')).toHaveCount(0);
    await page.goto('/#/settings');
    await page.locator('[data-locale=hi]').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally { await viewerContext.close(); }
});


test('all routes render, phone validation and offline/language states', async ({ page, context }) => {
  const crashes = [];
  page.on('pageerror', error => crashes.push(error.message));
  for (const route of ['welcome', 'home', 'my-cards', 'card-editor', 'public-card', 'saved-contacts', 'saved-detail', 'discover', 'business-detail', 'business-studio', 'settings', 'admin']) {
    await page.goto('/#/' + route);
    await expect(page.locator('main .content')).not.toBeEmpty();
    await expect(page.locator('footer')).toContainText('TownTap Alpha');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/#/welcome');
  await page.locator('[name=phone]').fill('123');
  await page.locator('#phoneForm button').click();
  await expect(page.locator('[role=alert]')).toBeVisible();
  await page.locator('[data-toggle-locale]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await context.setOffline(true);
  await expect(page.locator('[role=status]')).toContainText('आप ऑफ़लाइन हैं');
  await expect(page.locator('.alert-error')).toHaveCount(0);
  await context.setOffline(false);
  expect(crashes).toEqual([]);
});
