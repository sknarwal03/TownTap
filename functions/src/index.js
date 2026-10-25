import { createHash, randomBytes } from 'node:crypto';
import { initializeApp, getApps } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  directoryProjection,
  isMoreRestrictive,
  normalizeProfileInput,
  projectProfile,
  rankDirectoryResults,
} from './domain.js';

if (!getApps().length) initializeApp();
const db = getFirestore();
const MAX_NOTE_LENGTH = 1000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;
const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.GCLOUD_PROJECT || 'demo-towntap-local'}.appspot.com`;

function requireUser(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in to continue.');
  return uid;
}

function requireModerator(request) {
  const uid = requireUser(request);
  if (request.auth.token.moderator !== true) throw new HttpsError('permission-denied', 'Moderator access required.');
  return uid;
}

function cleanTags(value) {
  if (!Array.isArray(value) || value.length > MAX_TAGS) throw new HttpsError('invalid-argument', 'Invalid tags.');
  return [...new Set(value.map((tag) => {
    if (typeof tag !== 'string') throw new HttpsError('invalid-argument', 'Tags must be text.');
    const clean = tag.trim();
    if (!clean || clean.length > MAX_TAG_LENGTH) throw new HttpsError('invalid-argument', 'Invalid tag length.');
    return clean;
  }))];
}

async function consumeRateLimit(uid, action, limit, windowMs) {
  const key = createHash('sha256').update(`${uid}:${action}`).digest('hex');
  const ref = db.collection('rateLimits').doc(key);
  const now = Date.now();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists && snapshot.get('windowEndsAt').toMillis() > now ? snapshot.get('count') : 0;
    const windowEndsAt = snapshot.exists && snapshot.get('windowEndsAt').toMillis() > now
      ? snapshot.get('windowEndsAt')
      : Timestamp.fromMillis(now + windowMs);
    if (current >= limit) throw new HttpsError('resource-exhausted', 'Too many requests. Try again later.');
    transaction.set(ref, { count: current + 1, windowEndsAt, expireAt: Timestamp.fromMillis(windowEndsAt.toMillis() + windowMs) });
  });
}

function profileRef(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{10,80}$/.test(id)) throw new HttpsError('invalid-argument', 'Invalid profile.');
  return db.collection('profiles').doc(id);
}

function linkDigest(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null;
  return createHash('sha256').update(token).digest('hex');
}

async function updateDirectory(id, profile) {
  const ref = db.collection('businessDirectory').doc(id);
  const projection = directoryProjection(profile);
  if (projection) await ref.set(projection);
  else await ref.delete();
}

export const upsertProfile = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  await consumeRateLimit(uid, 'profile-write', 30, 60_000);
  let normalized;
  try { normalized = normalizeProfileInput(request.data?.profile); }
  catch (error) { throw new HttpsError('invalid-argument', error.message); }

  const requestedId = request.data?.profileId;
  const ref = requestedId ? profileRef(requestedId) : db.collection('profiles').doc();
  const profile = await db.runTransaction(async (transaction) => {
    const oldSnap = await transaction.get(ref);
    if (oldSnap.exists && oldSnap.get('ownerUid') !== uid) throw new HttpsError('permission-denied', 'You cannot edit this profile.');
    const previous = oldSnap.exists ? oldSnap.data() : null;
    const next = {
      ...normalized,
      id: ref.id,
      ownerUid: uid,
      status: previous?.status === 'suspended' ? 'suspended' : 'active',
      verificationStatus: previous?.verificationStatus ?? 'unverified',
      linkVersion: (previous?.linkVersion ?? 0) + (isMoreRestrictive(previous, normalized) ? 1 : 0),
      createdAt: previous?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    transaction.set(ref, next);
    const directoryRef = db.collection('businessDirectory').doc(ref.id);
    const projection = directoryProjection(next);
    if (projection) transaction.set(directoryRef, projection);
    else transaction.delete(directoryRef);
    return next;
  });
  return { profile: projectProfile(profile, 'owner') };
});

export const listMyProfiles = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const snapshot = await db.collection('profiles').where('ownerUid', '==', uid).orderBy('updatedAt', 'desc').limit(50).get();
  return { profiles: snapshot.docs.map((doc) => projectProfile({ id: doc.id, ...doc.data() }, 'owner')) };
});

export const createShareLink = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  await consumeRateLimit(uid, 'share-link', 5, 10 * 60_000);
  const ref = profileRef(request.data?.profileId);
  const token = randomBytes(32).toString('base64url');
  const linkRef = db.collection('shareLinks').doc(createHash('sha256').update(token).digest('hex'));
  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists || snap.get('ownerUid') !== uid) throw new HttpsError('not-found', 'Profile unavailable.');
    const profile = snap.data();
    if (profile.status !== 'active' || profile.visibility === 'private') throw new HttpsError('failed-precondition', 'Change profile visibility before creating a share link.');
    const version = (profile.linkVersion ?? 0) + 1;
    transaction.update(ref, { linkVersion: version, updatedAt: FieldValue.serverTimestamp() });
    transaction.create(linkRef, {
      profileId: ref.id,
      version,
      createdBy: uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { token };
});

export const revokeShareLinks = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const ref = profileRef(request.data?.profileId);
  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists || snap.get('ownerUid') !== uid) throw new HttpsError('not-found', 'Profile unavailable.');
    transaction.update(ref, { linkVersion: (snap.get('linkVersion') ?? 0) + 1, updatedAt: FieldValue.serverTimestamp() });
  });
  return { revoked: true };
});

export const resolveCard = onCall({ region: 'us-central1', maxInstances: 20 }, async (request) => {
  const ref = profileRef(request.data?.profileId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Card unavailable.');
  const profile = { id: snap.id, ...snap.data() };
  const owner = request.auth?.uid === profile.ownerUid;
  if (owner) return { profile: projectProfile(profile, 'owner'), owner: true };
  if (profile.status !== 'active') throw new HttpsError('not-found', 'Card unavailable.');

  let validLink = false;
  if (request.data?.shareToken) {
    const digest = linkDigest(request.data.shareToken);
    if (digest) {
      const link = await db.collection('shareLinks').doc(digest).get();
      validLink = link.exists && link.get('profileId') === profile.id && link.get('version') === profile.linkVersion;
    }
  }
  if (profile.visibility === 'private' || (profile.visibility === 'unlisted' && !validLink)) throw new HttpsError('not-found', 'Card unavailable.');
  return { profile: projectProfile(profile, validLink ? 'link' : 'public'), owner: false };
});

export const saveContact = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const ref = profileRef(request.data?.profileId);
  const snap = await ref.get();
  if (!snap.exists || snap.get('status') !== 'active' || snap.get('visibility') !== 'public' || snap.get('ownerUid') === uid) {
    throw new HttpsError('failed-precondition', 'This card cannot be saved.');
  }
  const savedRef = db.collection('users').doc(uid).collection('savedContacts').doc(ref.id);
  const previous = await savedRef.get();
  await savedRef.set({
    profileId: ref.id,
    savedAt: previous.exists ? previous.get('savedAt') : FieldValue.serverTimestamp(),
    note: previous.exists ? previous.get('note') : '',
    tags: previous.exists ? previous.get('tags') : [],
    nickname: previous.exists ? previous.get('nickname') : '',
  });
  return { saved: true };
});

export const updateSavedContact = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const id = request.data?.profileId;
  const ref = profileRef(id);
  const savedRef = db.collection('users').doc(uid).collection('savedContacts').doc(ref.id);
  const snap = await savedRef.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Saved card unavailable.');
  const note = request.data?.note;
  const nickname = request.data?.nickname;
  if (typeof note !== 'string' || note.trim().length > MAX_NOTE_LENGTH) throw new HttpsError('invalid-argument', 'Note is too long or invalid.');
  if (typeof nickname !== 'string' || nickname.trim().length > 80) throw new HttpsError('invalid-argument', 'Nickname is too long or invalid.');
  await savedRef.update({ note: note.trim(), nickname: nickname.trim(), tags: cleanTags(request.data?.tags ?? []) });
  return { saved: true };
});

export const listSavedContacts = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const saved = await db.collection('users').doc(uid).collection('savedContacts').orderBy('savedAt', 'desc').limit(200).get();
  const contacts = await Promise.all(saved.docs.map(async (doc) => {
    const relation = doc.data();
    const target = await db.collection('profiles').doc(relation.profileId).get();
    const live = target.exists && target.get('status') === 'active' && target.get('visibility') === 'public'
      ? projectProfile({ id: target.id, ...target.data() }, 'public')
      : null;
    return { profile: live, unavailable: !live, note: relation.note ?? '', nickname: relation.nickname ?? '', tags: relation.tags ?? [], savedAt: relation.savedAt ?? null };
  }));
  return { contacts };
});

export const removeSavedContact = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  const ref = profileRef(request.data?.profileId);
  await db.collection('users').doc(uid).collection('savedContacts').doc(ref.id).delete();
  return { removed: true };
});

export const searchBusinesses = onCall({ region: 'us-central1', maxInstances: 20 }, async (request) => {
  const city = typeof request.data?.city === 'string' ? request.data.city.trim() : '';
  const category = typeof request.data?.category === 'string' ? request.data.category.trim() : '';
  const term = typeof request.data?.term === 'string' ? request.data.term.trim().slice(0, 80) : '';
  let query = db.collection('businessDirectory');
  if (city) {
    const cityId = city.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    query = query.where('cityId', '==', cityId);
  } else {
    query = query.where('cityId', 'in', ['gohana', 'sonipat']);
  }
  if (category) {
    const categoryId = category.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    query = query.where('categoryId', '==', categoryId);
  }
  const snapshot = await query.limit(200).get();
  const items = snapshot.docs.map((doc) => doc.data());
  return { businesses: rankDirectoryResults(items, { term, city, category }).slice(0, 50) };
});

export const submitReport = onCall({ region: 'us-central1', maxInstances: 10 }, async (request) => {
  const uid = requireUser(request);
  await consumeRateLimit(uid, 'report', 5, 60 * 60_000);
  const targetId = request.data?.targetId;
  const targetType = request.data?.targetType;
  const reason = request.data?.reason;
  if (typeof targetId !== 'string' || !/^[A-Za-z0-9_-]{10,80}$/.test(targetId)) throw new HttpsError('invalid-argument', 'Invalid report target.');
  if (!['profile', 'business'].includes(targetType)) throw new HttpsError('invalid-argument', 'Invalid report type.');
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 1000) throw new HttpsError('invalid-argument', 'Invalid report reason.');
  const target = await db.collection('profiles').doc(targetId).get();
  if (!target.exists || (targetType === 'business' && target.get('type') !== 'business')) throw new HttpsError('not-found', 'Report target unavailable.');
  const ref = await db.collection('reports').add({ reporterUid: uid, targetId, targetType, reason: reason.trim(), status: 'open', createdAt: FieldValue.serverTimestamp() });
  return { reportId: ref.id, received: true };
});

export const requestBusinessVerification = onCall({ region: 'us-central1', maxInstances: 5 }, async (request) => {
  const uid = requireUser(request);
  await consumeRateLimit(uid, 'business-verification', 3, 24 * 60 * 60_000);
  const ref = profileRef(request.data?.profileId);
  const profile = await ref.get();
  if (!profile.exists || profile.get('ownerUid') !== uid || profile.get('type') !== 'business' || profile.get('status') !== 'active') {
    throw new HttpsError('not-found', 'Business profile unavailable.');
  }
  if (profile.get('verificationStatus') === 'pending' && profile.get('verificationRequestId')) {
    const existing = await db.collection('verificationRequests').doc(profile.get('verificationRequestId')).get();
    if (existing.exists && existing.get('requesterUid') === uid && existing.get('status') === 'pending') {
      return { requestId: existing.id, storagePath: `verificationEvidence/${uid}/${existing.id}/evidence` };
    }
  }
  const requestRef = db.collection('verificationRequests').doc();
  const batch = db.batch();
  batch.create(requestRef, {
    profileId: ref.id,
    requesterUid: uid,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.update(ref, { verificationStatus: 'pending', verificationRequestId: requestRef.id, updatedAt: FieldValue.serverTimestamp() });
  await batch.commit();
  return { requestId: requestRef.id, storagePath: `verificationEvidence/${uid}/${requestRef.id}/evidence` };
});

export const listVerificationQueue = onCall({ region: 'us-central1', maxInstances: 5 }, async (request) => {
  requireModerator(request);
  const snapshot = await db.collection('verificationRequests').where('status', '==', 'pending').orderBy('createdAt', 'asc').limit(100).get();
  return { requests: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), storagePath: `verificationEvidence/${doc.get('requesterUid')}/${doc.id}/evidence` })) };
});

export const reviewBusinessVerification = onCall({ region: 'us-central1', maxInstances: 5 }, async (request) => {
  const moderatorUid = requireModerator(request);
  const requestId = request.data?.requestId;
  const decision = request.data?.decision;
  const reviewNote = request.data?.reviewNote;
  if (typeof requestId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(requestId)) throw new HttpsError('invalid-argument', 'Invalid verification request.');
  if (!['approve', 'reject'].includes(decision)) throw new HttpsError('invalid-argument', 'Invalid review decision.');
  if (typeof reviewNote !== 'string' || reviewNote.trim().length > 500) throw new HttpsError('invalid-argument', 'Invalid review note.');
  const requestRef = db.collection('verificationRequests').doc(requestId);
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists || requestSnap.get('status') !== 'pending') throw new HttpsError('not-found', 'Verification request unavailable.');
  const profileRefValue = db.collection('profiles').doc(requestSnap.get('profileId'));
  const profile = await profileRefValue.get();
  if (!profile.exists || profile.get('ownerUid') !== requestSnap.get('requesterUid')) throw new HttpsError('failed-precondition', 'Verification target is unavailable.');
  if (decision === 'approve') {
    const evidencePath = `verificationEvidence/${requestSnap.get('requesterUid')}/${requestId}/evidence`;
    const evidence = getStorage().bucket(STORAGE_BUCKET).file(evidencePath);
    const [exists] = await evidence.exists();
    if (!exists) throw new HttpsError('failed-precondition', 'Evidence file is missing.');
    const [metadata] = await evidence.getMetadata();
    const size = Number(metadata.size);
    if (!Number.isFinite(size) || size < 1 || size > 10 * 1024 * 1024) throw new HttpsError('failed-precondition', 'Evidence file size is invalid.');
    const [contents] = await evidence.download();
    const fileType = metadata.contentType;
    const isPdf = fileType === 'application/pdf' && contents.subarray(0, 5).toString('ascii') === '%PDF-';
    const isPng = fileType === 'image/png' && contents.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = fileType === 'image/jpeg' && contents.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    const isWebp = fileType === 'image/webp' && contents.subarray(0, 4).toString('ascii') === 'RIFF' && contents.subarray(8, 12).toString('ascii') === 'WEBP';
    if (!(isPdf || isPng || isJpeg || isWebp)) throw new HttpsError('failed-precondition', 'Evidence file type could not be verified.');
  }
  const result = decision === 'approve' ? 'verified' : 'rejected';
  await db.runTransaction(async (transaction) => {
    const currentRequest = await transaction.get(requestRef);
    const currentProfile = await transaction.get(profileRefValue);
    if (!currentRequest.exists || currentRequest.get('status') !== 'pending') throw new HttpsError('failed-precondition', 'Verification request has already been reviewed.');
    if (!currentProfile.exists || currentProfile.get('ownerUid') !== currentRequest.get('requesterUid')) throw new HttpsError('failed-precondition', 'Verification target is unavailable.');
    const profileData = { id: profileRefValue.id, ...currentProfile.data(), verificationStatus: result, updatedAt: FieldValue.serverTimestamp() };
    transaction.update(requestRef, { status: result, reviewNote: reviewNote.trim(), reviewedBy: moderatorUid, reviewedAt: FieldValue.serverTimestamp() });
    transaction.update(profileRefValue, { verificationStatus: result, verificationRequestId: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
    const projection = directoryProjection(profileData);
    const directoryRef = db.collection('businessDirectory').doc(profileRefValue.id);
    if (projection) transaction.set(directoryRef, projection);
    else transaction.delete(directoryRef);
    transaction.create(db.collection('moderationAudit').doc(), { actorUid: moderatorUid, profileId: profileRefValue.id, requestId, action: `verification-${decision}`, createdAt: FieldValue.serverTimestamp() });
  });
  return { reviewed: true, status: result };
});

export const listModerationQueue = onCall({ region: 'us-central1', maxInstances: 5 }, async (request) => {
  requireModerator(request);
  const snapshot = await db.collection('reports').where('status', '==', 'open').orderBy('createdAt', 'asc').limit(100).get();
  return { reports: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

export const resolveReport = onCall({ region: 'us-central1', maxInstances: 5 }, async (request) => {
  const moderatorUid = requireModerator(request);
  const reportId = request.data?.reportId;
  const action = request.data?.action;
  if (typeof reportId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reportId)) throw new HttpsError('invalid-argument', 'Invalid report.');
  if (!['dismiss', 'unpublish'].includes(action)) throw new HttpsError('invalid-argument', 'Invalid moderation action.');
  const reportRef = db.collection('reports').doc(reportId);
  await db.runTransaction(async (transaction) => {
    const report = await transaction.get(reportRef);
    if (!report.exists || report.get('status') !== 'open') throw new HttpsError('not-found', 'Report unavailable.');
    const targetRef = db.collection('profiles').doc(report.get('targetId'));
    const target = action === 'unpublish' ? await transaction.get(targetRef) : null;
    transaction.update(reportRef, { status: action === 'dismiss' ? 'dismissed' : 'actioned', resolvedBy: moderatorUid, resolvedAt: FieldValue.serverTimestamp() });
    if (action === 'unpublish' && target?.exists) {
      transaction.update(targetRef, { status: 'suspended', linkVersion: (target.get('linkVersion') ?? 0) + 1, updatedAt: FieldValue.serverTimestamp() });
      transaction.delete(db.collection('businessDirectory').doc(target.id));
    }
    transaction.create(db.collection('moderationAudit').doc(), { actorUid: moderatorUid, reportId, targetId: report.get('targetId'), action, createdAt: FieldValue.serverTimestamp() });
  });
  return { resolved: true };
});
