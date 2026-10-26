import test from 'node:test';
import assert from 'node:assert/strict';
import {
  directoryProjection,
  isMoreRestrictive,
  normalizeProfileInput,
  projectProfile,
  rankDirectoryResults,
} from '../src/domain.js';

function profileInput(overrides = {}) {
  const { fields: overrideFields, ...otherOverrides } = overrides;
  return {
    type: 'personal',
    visibility: 'private',
    ...otherOverrides,
    fields: {
      displayName: { value: 'Asha', audience: 'private' },
      phone: { value: '+911234567890', audience: 'private' },
      ...overrideFields,
    },
  };
}

test('profiles start private and all unspecified fields are private', () => {
  const profile = normalizeProfileInput({ type: 'personal', fields: { displayName: { value: 'Asha' }, phone: { value: '+911234567890' } } });
  assert.equal(profile.visibility, 'private');
  assert.equal(profile.fields.phone.audience, 'private');
  assert.equal(profile.fields.displayName.audience, 'private');
});

test('profile input rejects unknown fields and invalid audiences', () => {
  assert.throws(() => normalizeProfileInput(profileInput({ fields: { displayName: { value: 'Asha' }, privateNote: { value: 'oops' } } })), /Unsupported profile field/);
  assert.throws(() => normalizeProfileInput(profileInput({ fields: { displayName: { value: 'Asha', audience: 'anyone' } } })), /Invalid displayName audience/);
});

test('discoverable business requires public name, category and city', () => {
  assert.throws(() => normalizeProfileInput(profileInput({ type: 'business', visibility: 'public', discoverable: true })), /public name, category, and city/);
});

test('projections omit link-only and private fields from an ordinary public read', () => {
  const profile = {
    id: 'profile1234567890', type: 'personal', visibility: 'public',
    ownerUid: 'owner', fields: {
      displayName: { value: 'Asha', audience: 'public' },
      phone: { value: '+911234567890', audience: 'link' },
      email: { value: 'private@example.test', audience: 'private' },
    },
  };
  assert.deepEqual(projectProfile(profile, 'public').fields, { displayName: 'Asha' });
  assert.deepEqual(projectProfile(profile, 'link').fields, { displayName: 'Asha', phone: '+911234567890' });
  assert.deepEqual(projectProfile(profile, 'owner').fields, { displayName: 'Asha', phone: '+911234567890', email: 'private@example.test' });
});

test('restrictive mode or field changes invalidate issued share versions', () => {
  const before = normalizeProfileInput({
    type: 'personal', visibility: 'public',
    fields: { displayName: { value: 'Asha', audience: 'public' }, phone: { value: '+911234567890', audience: 'link' } },
  });
  const hidePhone = normalizeProfileInput({
    type: 'personal', visibility: 'public',
    fields: { displayName: { value: 'Asha', audience: 'public' }, phone: { value: '+911234567890', audience: 'private' } },
  });
  const privateMode = normalizeProfileInput({ type: 'personal', visibility: 'private', fields: before.fields });
  assert.equal(isMoreRestrictive(before, hidePhone), true);
  assert.equal(isMoreRestrictive(before, privateMode), true);
  assert.equal(isMoreRestrictive(before, before), false);
});

test('directory projection contains only public eligible business fields', () => {
  const profile = normalizeProfileInput({
    type: 'business', visibility: 'public', discoverable: true,
    fields: {
      displayName: { value: 'Repair Shop', audience: 'public' },
      category: { value: 'Repair', audience: 'public' },
      city: { value: 'Gohana', audience: 'public' },
      phone: { value: '+911234567890', audience: 'link' },
      address: { value: 'Private address', audience: 'private' },
    },
  });
  const projection = directoryProjection({ id: 'profile1234567890', ...profile, status: 'active' });
  assert.equal(projection.name, 'Repair Shop');
  assert.equal(projection.cityId, 'gohana');
  assert.equal('phone' in projection, false);
  assert.equal('address' in projection, false);
  assert.equal(directoryProjection({ id: 'profile1234567890', ...profile, status: 'suspended' }), null);
});

test('directory prioritizes Gohana and Sonipat when city is not specified', () => {
  const items = [
    { name: 'Outside', city: 'Delhi' },
    { name: 'Sonipat Shop', city: 'Sonipat' },
    { name: 'Gohana Shop', city: 'Gohana' },
  ];
  assert.deepEqual(rankDirectoryResults(items).map((item) => item.name), ['Gohana Shop', 'Sonipat Shop', 'Outside']);
  assert.deepEqual(rankDirectoryResults(items, { city: 'Delhi' }).map((item) => item.name), ['Outside']);
});
