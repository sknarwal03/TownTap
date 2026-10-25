import test, { before } from 'node:test';
import assert from 'node:assert/strict';

const projectId = 'demo-towntap-local';
const apiKey = 'demo-api-key';
const functionBase = `http://127.0.0.1:5001/${projectId}/us-central1`;
let ownerToken;
let saverToken;

async function createUser(label) {
  const response = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: `${label}@example.test`, password: 'TownTap-emulator-only-Password-123!', returnSecureToken: true }),
  });
  const result = await response.json();
  assert.equal(response.ok, true, JSON.stringify(result));
  return result.idToken;
}

async function call(name, token, data = {}) {
  const response = await fetch(`${functionBase}/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ data }),
  });
  const payload = await response.json();
  return { response, result: payload.result !== undefined ? { data: payload.result } : payload };
}

before(async () => {
  ownerToken = await createUser(`owner-${Date.now()}`);
  saverToken = await createUser(`saver-${Date.now()}`);
});

test('callable cards enforce Private, Public, Link-only, revocation and live saved views', async () => {
  const created = await call('upsertProfile', ownerToken, {
    profile: { type: 'personal', fields: { displayName: { value: 'Emulator Sample' }, phone: { value: '+911234567890', audience: 'link' }, email: { value: 'private@example.test' } } },
  });
  assert.equal(created.response.ok, true, JSON.stringify(created.result));
  const profileId = created.result.data.profile.id;
  assert.equal(created.result.data.profile.visibility, 'private');

  const blockedPrivate = await call('resolveCard', saverToken, { profileId });
  assert.equal(blockedPrivate.result.error?.status, 'NOT_FOUND');

  const published = await call('upsertProfile', ownerToken, {
    profileId,
    profile: { type: 'personal', visibility: 'public', fields: {
      displayName: { value: 'Emulator Sample', audience: 'public' },
      phone: { value: '+911234567890', audience: 'link' },
      email: { value: 'private@example.test', audience: 'private' },
    } },
  });
  assert.equal(published.response.ok, true, JSON.stringify(published.result));
  assert.equal((await call('saveContact', saverToken, { profileId })).response.ok, true);

  const publicRead = await call('resolveCard', saverToken, { profileId });
  assert.equal(publicRead.result.data.profile.fields.displayName, 'Emulator Sample');
  assert.equal('phone' in publicRead.result.data.profile.fields, false);
  assert.equal('email' in publicRead.result.data.profile.fields, false);

  const issued = await call('createShareLink', ownerToken, { profileId });
  assert.equal(issued.response.ok, true, JSON.stringify(issued.result));
  const linkRead = await call('resolveCard', saverToken, { profileId, shareToken: issued.result.data.token });
  assert.equal(linkRead.result.data.profile.fields.phone, '+911234567890');
  assert.equal('email' in linkRead.result.data.profile.fields, false);

  assert.equal((await call('revokeShareLinks', ownerToken, { profileId })).response.ok, true);
  const publicAfterRevoke = await call('resolveCard', saverToken, { profileId, shareToken: issued.result.data.token });
  assert.equal(publicAfterRevoke.result.data.profile.fields.displayName, 'Emulator Sample');
  assert.equal('phone' in publicAfterRevoke.result.data.profile.fields, false);

  const restricted = await call('upsertProfile', ownerToken, {
    profileId,
    profile: { type: 'personal', visibility: 'unlisted', fields: {
      displayName: { value: 'Emulator Sample', audience: 'public' },
      phone: { value: '+911234567890', audience: 'link' },
    } },
  });
  assert.equal(restricted.response.ok, true, JSON.stringify(restricted.result));
  const revokedRead = await call('resolveCard', saverToken, { profileId, shareToken: issued.result.data.token });
  assert.equal(revokedRead.result.error?.status, 'NOT_FOUND');
  const savedView = await call('listSavedContacts', saverToken);
  assert.equal(savedView.response.ok, true, JSON.stringify(savedView.result));
  assert.equal(savedView.result.data.contacts[0].unavailable, true);
  assert.deepEqual(savedView.result.data.contacts[0].profile, null);
  assert.equal(savedView.result.data.contacts[0].profileId, profileId);
  const updated = await call('updateSavedContact', saverToken, { profileId, note: 'Private context', nickname: 'My contact', tags: ['local'] });
  assert.equal(updated.response.ok, true);
  const unavailable = (await call('listSavedContacts', saverToken)).result.data.contacts[0];
  assert.equal(unavailable.note, 'Private context');
  assert.equal(unavailable.profile, null);
  assert.equal((await call('removeSavedContact', saverToken, { profileId })).response.ok, true);
  assert.deepEqual((await call('listSavedContacts', saverToken)).result.data.contacts, []);
});

test('callable profile writes reject unauthenticated callers', async () => {
  const result = await call('upsertProfile', null, { profile: { type: 'personal', fields: { displayName: { value: 'No Auth' } } } });
  assert.equal(result.result.error?.status, 'UNAUTHENTICATED');
});
