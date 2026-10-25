import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-towntap-local',
    firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});

after(async () => testEnv?.cleanup());

test('direct client reads and writes are denied for private and public documents', async () => {
  const owner = testEnv.authenticatedContext('owner-a').firestore();
  const saver = testEnv.authenticatedContext('saver-b').firestore();
  const guest = testEnv.unauthenticatedContext().firestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'profiles/profile1234567890'), { ownerUid: 'owner-a', fields: { phone: '+911234567890' } });
    await setDoc(doc(context.firestore(), 'businessDirectory/profile1234567890'), { name: 'Public sample' });
    await setDoc(doc(context.firestore(), 'users/saver-b/savedContacts/profile1234567890'), { note: 'private note' });
  });
  await assertFails(getDoc(doc(owner, 'profiles/profile1234567890')));
  await assertFails(getDoc(doc(guest, 'businessDirectory/profile1234567890')));
  await assertFails(getDoc(doc(saver, 'users/saver-b/savedContacts/profile1234567890')));
  await assertFails(getDoc(doc(owner, 'users/saver-b/savedContacts/profile1234567890')));
  await assertFails(setDoc(doc(owner, 'profiles/profile1234567890'), { visibility: 'public' }));
});
