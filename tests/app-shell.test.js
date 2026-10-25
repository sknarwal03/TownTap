import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../public/service-worker.js', import.meta.url), 'utf8');

test('app shell includes all twelve exact PRD screen names in English and Hindi', () => {
  for (const label of ['Welcome', 'Home', 'My Cards', 'Card Editor', 'Public Card', 'Saved Contacts', 'Saved Detail', 'Discover', 'Business Detail', 'Business Studio', 'Settings', 'Admin']) {
    assert.match(source, new RegExp(`\\['[^']+', '${label}', '[^']+'\\]`), `missing bilingual label for ${label}`);
  }
});

test('primary navigation preserves the five PRD areas', () => {
  for (const label of ['Home', 'Saved', 'Discover', 'My Cards', 'Profile']) assert.ok(source.includes(`en: '${label}'`));
});

test('service worker does not cache responses', () => {
  assert.match(worker, /fetch\(new Request\(event\.request, \{ cache: 'no-store' \}\)\)/);
  assert.doesNotMatch(worker, /caches\.|cache\.put|\.put\(/);
});

test('emulator setup and all backend calls use guarded SDK paths', async () => {
  const firebase = await readFile(new URL('../src/firebase.js', import.meta.url), 'utf8');
  const services = await readFile(new URL('../src/services.js', import.meta.url), 'utf8');
  const backend = await readFile(new URL('../functions/src/index.js', import.meta.url), 'utf8');
  assert.match(firebase, /firebaseLiveDevBlocked/);
  assert.match(firebase, /connectAuthEmulator/);
  assert.match(services, /httpsCallable/);
  assert.match(backend, /function requireModerator/);
  assert.match(backend, /request\.auth\.token\.moderator !== true/);
});
