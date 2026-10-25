import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage, ref, uploadBytes, getBytes } from 'firebase/storage';
import { connectFirestoreEmulator, getFirestore as getClientFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Refuse non-local targets before initializing any privileged SDK.
for (const [name, port] of Object.entries({ FIREBASE_AUTH_EMULATOR_HOST: 9099, FIRESTORE_EMULATOR_HOST: 8080, FIREBASE_STORAGE_EMULATOR_HOST: 9199 })) {
  process.env[name] ??= `127.0.0.1:${port}`;
  assert.ok([`127.0.0.1:${port}`, `localhost:${port}`].includes(process.env[name]), `${name} must point to the local demo emulator`);
}
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp: initializeAdminApp, deleteApp: deleteAdminApp } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const projectId = 'demo-towntap-local';
const admin = initializeAdminApp({ projectId }, `moderation-${randomUUID()}`);
const db = getFirestore(admin);
const apps = [];
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=', 'base64'));

after(async () => {
  await Promise.all(apps.map(app => deleteApp(app)));
  await db.terminate();
  await deleteAdminApp(admin);
});

async function actor(claims) {
  const id = randomUUID();
  const app = initializeApp({ projectId, apiKey: 'demo-api-key', storageBucket: `${projectId}.appspot.com` }, id);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const { user } = await createUserWithEmailAndPassword(auth, `${id}@example.test`, 'Emulator-only-Password-123!');
  if (claims) await getAdminAuth(admin).setCustomUserClaims(user.uid, claims);
  const token = await user.getIdToken(true);
  const storage = getStorage(app);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  const firestore = getClientFirestore(app);
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  return { uid: user.uid, token, storage, firestore };
}

async function call(name, user, data = {}) {
  const response = await fetch(`http://127.0.0.1:5001/${projectId}/us-central1/${name}`, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'content-type': 'application/json', ...(user ? { authorization: `Bearer ${user.token}` } : {}) },
    body: JSON.stringify({ data }),
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

async function succeeds(name, user, data) {
  const response = await call(name, user, data);
  assert.equal(response.status, 200, `${name}: ${JSON.stringify(response)}`);
  assert.ok(Object.hasOwn(response, 'result'), `${name} must return a callable result`);
  return response.result;
}

async function denied(name, user, data, code) {
  const response = await call(name, user, data);
  assert.notEqual(response.status, 200, `${name} unexpectedly succeeded`);
  assert.equal(response.error?.status, code, JSON.stringify(response));
}

function business(name = `Business ${randomUUID()}`) {
  return { type: 'business', visibility: 'public', discoverable: true, fields: {
    displayName: { value: name, audience: 'public' },
    category: { value: 'Repairs', audience: 'public' },
    city: { value: 'Gohana', audience: 'public' },
    email: { value: 'private@example.test', audience: 'private' },
  } };
}

async function fixture() {
  const owner = await actor();
  const other = await actor();
  const moderator = await actor({ moderator: true });
  const profile = business();
  const { profile: created } = await succeeds('upsertProfile', owner, { profile });
  return { owner, other, moderator, profile, profileId: created.id };
}

async function audits(field, id) {
  return (await db.collection('moderationAudit').where(field, '==', id).get()).docs.map(doc => doc.data());
}

test('moderator endpoints deny guests, ordinary users and non-boolean claims; evidence requests require ownership', async () => {
  const { owner, other, moderator, profileId } = await fixture();
  const request = await succeeds('requestBusinessVerification', owner, { profileId });
  const { reportId } = await succeeds('submitReport', other, { targetId: profileId, targetType: 'business', reason: 'Investigate this listing' });
  const falseModerator = await actor({ moderator: false });
  const stringModerator = await actor({ moderator: 'true' });
  for (const user of [null, owner, other, falseModerator, stringModerator]) {
    const code = user ? 'PERMISSION_DENIED' : 'UNAUTHENTICATED';
    await denied('listVerificationQueue', user, {}, code);
    await denied('listModerationQueue', user, {}, code);
    await denied('reviewBusinessVerification', user, { requestId: request.requestId, decision: 'approve', reviewNote: '' }, code);
    await denied('resolveReport', user, { reportId, action: 'unpublish' }, code);
  }
  await denied('requestBusinessVerification', other, { profileId }, 'NOT_FOUND');
  await denied('requestBusinessVerification', null, { profileId }, 'UNAUTHENTICATED');
  assert.equal((await db.doc(`verificationRequests/${request.requestId}`).get()).get('status'), 'pending');
  assert.equal((await db.doc(`reports/${reportId}`).get()).get('status'), 'open');
  assert.deepEqual(await audits('requestId', request.requestId), []);
  assert.deepEqual(await audits('reportId', reportId), []);
  assert.ok((await succeeds('listVerificationQueue', moderator)).requests.some(item => item.id === request.requestId));
});

test('owner evidence upload and moderator approval update request, badge, directory and exactly one audit', async () => {
  const { owner, other, moderator, profileId } = await fixture();
  const request = await succeeds('requestBusinessVerification', owner, { profileId });
  assert.equal((await succeeds('resolveCard', other, { profileId })).profile.verificationStatus, null);
  await assert.rejects(uploadBytes(ref(other.storage, request.storagePath), png, { contentType: 'image/png' }), { code: 'storage/unauthorized' });
  await uploadBytes(ref(owner.storage, request.storagePath), png, { contentType: 'image/png' });
  await assert.rejects(getBytes(ref(other.storage, request.storagePath)), { code: 'storage/unauthorized' });
  assert.deepEqual(new Uint8Array(await getBytes(ref(moderator.storage, request.storagePath))), png);
  const queueItem = (await succeeds('listVerificationQueue', moderator)).requests.find(item => item.id === request.requestId);
  assert.equal(queueItem.storagePath, request.storagePath);
  assert.equal(queueItem.requesterUid, owner.uid);
  const decision = await succeeds('reviewBusinessVerification', moderator, { requestId: request.requestId, decision: 'approve', reviewNote: 'Evidence reviewed in emulator' });
  assert.equal(decision.status, 'verified');
  const stored = (await db.doc(`verificationRequests/${request.requestId}`).get()).data();
  assert.equal(stored.status, 'verified');
  assert.equal(stored.reviewedBy, moderator.uid);
  assert.ok(stored.reviewedAt.toMillis() > 0);
  assert.equal(stored.reviewNote, 'Evidence reviewed in emulator');
  const current = (await db.doc(`profiles/${profileId}`).get()).data();
  assert.equal(current.verificationStatus, 'verified');
  assert.equal(current.verificationRequestId, undefined);
  assert.equal((await succeeds('resolveCard', other, { profileId })).profile.verificationStatus, 'verified');
  const listed = (await succeeds('searchBusinesses', other, { term: current.fields.displayName.value })).businesses;
  assert.equal(listed.find(item => item.profileId === profileId)?.verified, true);
  assert.ok(!(await succeeds('listVerificationQueue', moderator)).requests.some(item => item.id === request.requestId));
  await denied('reviewBusinessVerification', moderator, { requestId: request.requestId, decision: 'reject', reviewNote: '' }, 'NOT_FOUND');
  await assert.rejects(uploadBytes(ref(owner.storage, request.storagePath), png, { contentType: 'image/png' }), { code: 'storage/unauthorized' });
  const events = await audits('requestId', request.requestId);
  assert.equal(events.length, 1);
  assert.equal(events[0].action, 'verification-approve');
  assert.equal(events[0].actorUid, moderator.uid);
  assert.equal(events[0].profileId, profileId);
  assert.ok(events[0].createdAt.toMillis() > 0);
  const audit = (await db.collection('moderationAudit').where('requestId', '==', request.requestId).get()).docs[0];
  // Even moderators use callables; direct client access must not allow audit tampering.
  await assert.rejects(getDoc(doc(moderator.firestore, audit.ref.path)), { code: 'permission-denied' });
  await assert.rejects(setDoc(doc(moderator.firestore, audit.ref.path), { action: 'forged' }), { code: 'permission-denied' });
  assert.equal((await audit.ref.get()).get('action'), 'verification-approve');
});

test('rejection removes pending request, leaves no public badge and records the reviewer', async () => {
  const { owner, other, moderator, profileId } = await fixture();
  const request = await succeeds('requestBusinessVerification', owner, { profileId });
  await uploadBytes(ref(owner.storage, request.storagePath), png, { contentType: 'image/png' });
  const result = await succeeds('reviewBusinessVerification', moderator, { requestId: request.requestId, decision: 'reject', reviewNote: 'Insufficient evidence' });
  assert.equal(result.status, 'rejected');
  const stored = (await db.doc(`verificationRequests/${request.requestId}`).get()).data();
  assert.equal(stored.status, 'rejected');
  assert.equal(stored.reviewedBy, moderator.uid);
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('verificationRequestId'), undefined);
  assert.equal((await succeeds('resolveCard', other, { profileId })).profile.verificationStatus, null);
  assert.equal((await db.doc(`businessDirectory/${profileId}`).get()).get('verified'), false);
  assert.ok(!(await succeeds('listVerificationQueue', moderator)).requests.some(item => item.id === request.requestId));
  await assert.rejects(uploadBytes(ref(owner.storage, request.storagePath), png, { contentType: 'image/png' }), { code: 'storage/unauthorized' });
  const events = await audits('requestId', request.requestId);
  assert.equal(events.length, 1);
  assert.equal(events[0].action, 'verification-reject');
  assert.equal(events[0].actorUid, moderator.uid);
});

test('missing or spoofed evidence cannot approve a business or create an audit entry', async () => {
  const { owner, moderator, profileId } = await fixture();
  const request = await succeeds('requestBusinessVerification', owner, { profileId });
  const review = { requestId: request.requestId, decision: 'approve', reviewNote: '' };
  await denied('reviewBusinessVerification', moderator, review, 'FAILED_PRECONDITION');
  // Storage accepts this declared MIME type; the callable must inspect the actual bytes.
  await uploadBytes(ref(owner.storage, request.storagePath), new TextEncoder().encode('not a PNG'), { contentType: 'image/png' });
  await denied('reviewBusinessVerification', moderator, review, 'FAILED_PRECONDITION');
  assert.equal((await db.doc(`verificationRequests/${request.requestId}`).get()).get('status'), 'pending');
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('verificationStatus'), 'pending');
  assert.equal((await db.doc(`businessDirectory/${profileId}`).get()).get('verified'), false);
  assert.deepEqual(await audits('requestId', request.requestId), []);
});

test('editing a pending business retains the request and evidence instead of creating an orphan review', async () => {
  const { owner, moderator, profileId, profile } = await fixture();
  const first = await succeeds('requestBusinessVerification', owner, { profileId });
  await uploadBytes(ref(owner.storage, first.storagePath), png, { contentType: 'image/png' });
  await succeeds('upsertProfile', owner, { profileId, profile: { ...profile, fields: { ...profile.fields, bio: { value: 'Updated description', audience: 'public' } } } });
  const second = await succeeds('requestBusinessVerification', owner, { profileId });
  assert.deepEqual(second, first);
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('verificationRequestId'), first.requestId);
  const queue = (await succeeds('listVerificationQueue', moderator)).requests.filter(item => item.profileId === profileId);
  assert.equal(queue.length, 1);
  await succeeds('reviewBusinessVerification', moderator, { requestId: first.requestId, decision: 'approve', reviewNote: '' });
});

test('concurrent verification submissions reuse one pending request', async () => {
  const { owner, profileId } = await fixture();
  const requests = await Promise.all([
    succeeds('requestBusinessVerification', owner, { profileId }),
    succeeds('requestBusinessVerification', owner, { profileId }),
  ]);
  assert.deepEqual(requests[0], requests[1]);
  assert.equal((await db.collection('verificationRequests').where('profileId', '==', profileId).get()).size, 1);
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('verificationRequestId'), requests[0].requestId);
});

test('pending verification cannot approve a profile that is no longer an active business', async () => {
  for (const restriction of ['personal', 'suspended']) {
    const { owner, other, moderator, profileId, profile } = await fixture();
    const request = await succeeds('requestBusinessVerification', owner, { profileId });
    await uploadBytes(ref(owner.storage, request.storagePath), png, { contentType: 'image/png' });
    if (restriction === 'personal') {
      await succeeds('upsertProfile', owner, { profileId, profile: { ...profile, type: 'personal', discoverable: false } });
    } else {
      const { reportId } = await succeeds('submitReport', other, { targetId: profileId, targetType: 'business', reason: 'Listing must be suspended' });
      await succeeds('resolveReport', moderator, { reportId, action: 'unpublish' });
    }
    await denied('reviewBusinessVerification', moderator, { requestId: request.requestId, decision: 'approve', reviewNote: '' }, 'FAILED_PRECONDITION');
    assert.equal((await db.doc(`verificationRequests/${request.requestId}`).get()).get('status'), 'pending');
    assert.equal((await db.doc(`profiles/${profileId}`).get()).get('verificationStatus'), 'pending');
    assert.deepEqual(await audits('requestId', request.requestId), []);
  }
});

test('report dismissal and unpublish enforce card/link/directory/saved restrictions and immutable audit outcomes', async () => {
  const { owner, other, moderator, profileId, profile } = await fixture();
  await succeeds('saveContact', other, { profileId });
  await succeeds('updateSavedContact', other, { profileId, note: 'Saver-only context', nickname: 'Local shop', tags: ['local'] });
  const share = await succeeds('createShareLink', owner, { profileId });
  const { reportId: dismissedId } = await succeeds('submitReport', other, { targetId: profileId, targetType: 'business', reason: 'First report' });
  assert.ok((await succeeds('listModerationQueue', moderator)).reports.some(item => item.id === dismissedId));
  await succeeds('resolveReport', moderator, { reportId: dismissedId, action: 'dismiss' });
  assert.equal((await db.doc(`reports/${dismissedId}`).get()).get('status'), 'dismissed');
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('status'), 'active');
  assert.equal((await succeeds('resolveCard', null, { profileId })).profile.id, profileId);
  assert.equal((await db.doc(`businessDirectory/${profileId}`).get()).exists, true);
  await denied('resolveReport', moderator, { reportId: dismissedId, action: 'unpublish' }, 'NOT_FOUND');
  const { reportId } = await succeeds('submitReport', other, { targetId: profileId, targetType: 'business', reason: 'Actionable report' });
  const oldVersion = (await db.doc(`profiles/${profileId}`).get()).get('linkVersion');
  await succeeds('resolveReport', moderator, { reportId, action: 'unpublish' });
  const stored = (await db.doc(`reports/${reportId}`).get()).data();
  assert.equal(stored.status, 'actioned');
  assert.equal(stored.resolvedBy, moderator.uid);
  assert.ok(stored.resolvedAt.toMillis() > 0);
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('linkVersion'), oldVersion + 1);
  assert.equal((await db.doc(`businessDirectory/${profileId}`).get()).exists, false);
  assert.ok(!(await succeeds('searchBusinesses', null, { term: profile.fields.displayName.value })).businesses.some(item => item.profileId === profileId));
  for (const user of [null, other]) {
    await denied('resolveCard', user, { profileId }, 'NOT_FOUND');
    await denied('resolveCard', user, { profileId, shareToken: share.token }, 'NOT_FOUND');
  }
  const contact = (await succeeds('listSavedContacts', other)).contacts.find(item => item.profileId === profileId);
  assert.equal(contact.profile, null);
  assert.equal(contact.unavailable, true);
  assert.equal(contact.note, 'Saver-only context');
  assert.deepEqual((await succeeds('listSavedContacts', owner)).contacts, []);
  await succeeds('upsertProfile', owner, { profileId, profile });
  assert.equal((await db.doc(`profiles/${profileId}`).get()).get('status'), 'suspended');
  assert.equal((await db.doc(`businessDirectory/${profileId}`).get()).exists, false);
  await denied('createShareLink', owner, { profileId }, 'FAILED_PRECONDITION');
  await denied('requestBusinessVerification', owner, { profileId }, 'NOT_FOUND');
  await denied('resolveReport', moderator, { reportId, action: 'dismiss' }, 'NOT_FOUND');
  const queue = (await succeeds('listModerationQueue', moderator)).reports;
  assert.ok(!queue.some(item => [reportId, dismissedId].includes(item.id)));
  for (const [id, action] of [[dismissedId, 'dismiss'], [reportId, 'unpublish']]) {
    const events = await audits('reportId', id);
    assert.equal(events.length, 1);
    assert.equal(events[0].actorUid, moderator.uid);
    assert.equal(events[0].targetId, profileId);
    assert.equal(events[0].action, action);
    assert.ok(events[0].createdAt.toMillis() > 0);
  }
});
