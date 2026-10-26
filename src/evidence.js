import { firebaseReadyForApp, getFirebaseStorage } from './firebase.js';

export async function uploadVerificationEvidence(path, file, ownerUid) {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured.');
  const [{ ref, uploadBytes }, storage] = await Promise.all([
    import('firebase/storage'),
    getFirebaseStorage(),
  ]);
  return uploadBytes(ref(storage, path), file, {
    contentType: file.type,
    customMetadata: { ownerUid },
  });
}

export async function downloadVerificationEvidence(path) {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured.');
  const [{ getBytes, ref }, storage] = await Promise.all([
    import('firebase/storage'),
    getFirebaseStorage(),
  ]);
  return new Blob([await getBytes(ref(storage, path))]);
}
