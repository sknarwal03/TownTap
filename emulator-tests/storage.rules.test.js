import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';

let testEnv;
const projectId = 'demo-towntap-local';

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
    storage: { rules: await readFile(new URL('../storage.rules', import.meta.url), 'utf8') },
  });
});

after(async () => testEnv?.cleanup());

test('evidence uploads require an owner and an active pending request', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'verificationRequests/verification12345678'), {
      requesterUid: 'owner-a', status: 'pending', profileId: 'profile1234567890',
    });
  });
  const ownerStorage = testEnv.authenticatedContext('owner-a').storage();
  const otherStorage = testEnv.authenticatedContext('other-user').storage();
  const moderatorStorage = testEnv.authenticatedContext('reviewer', { moderator: true }).storage();
  const path = 'verificationEvidence/owner-a/verification12345678/evidence';
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  await assertSucceeds(uploadBytes(ref(ownerStorage, path), png, { contentType: 'image/png' }));
  await assertFails(getBytes(ref(otherStorage, path)));
  await assertSucceeds(getBytes(ref(moderatorStorage, path)));
  await assertFails(uploadBytes(ref(otherStorage, path), png, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(ownerStorage, 'unrelated/file'), png, { contentType: 'image/png' }));
});

test('evidence rules reject excessive size and unapproved content types', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'verificationRequests/verification87654321'), {
      requesterUid: 'owner-a', status: 'pending', profileId: 'profile1234567890',
    });
  });
  const ownerStorage = testEnv.authenticatedContext('owner-a').storage();
  const path = 'verificationEvidence/owner-a/verification87654321/evidence';
  await assertFails(uploadBytes(ref(ownerStorage, path), new Uint8Array([1, 2, 3]), { contentType: 'text/html' }));
  await assertFails(uploadBytes(ref(ownerStorage, path), new Uint8Array(10 * 1024 * 1024 + 1), { contentType: 'application/pdf' }));
});
