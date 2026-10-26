import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const env = import.meta.env;
const emulatorMode = env.VITE_USE_FIREBASE_EMULATORS === 'true';
const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
const missing = required.filter((key) => !env[key]);

if (emulatorMode && !env.DEV) throw new Error('Firebase emulators can only be enabled in a development build.');

export const firebaseReady = missing.length === 0;
export const firebaseLiveDevBlocked = env.DEV && !emulatorMode;
export const firebaseReadyForApp = firebaseReady && !firebaseLiveDevBlocked;
export const firebaseMissingConfig = missing;
export const firebaseIsEmulated = emulatorMode;

let app;
let auth;
let functionsPromise;
let storagePromise;

if (firebaseReadyForApp) {
  app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);

  if (emulatorMode) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

export async function getFirebaseFunctions() {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured.');
  functionsPromise ??= import('firebase/functions').then(({ connectFunctionsEmulator, getFunctions }) => {
    const instance = getFunctions(app, 'us-central1');
    if (emulatorMode) connectFunctionsEmulator(instance, '127.0.0.1', 5001);
    return instance;
  });
  return functionsPromise;
}

export async function getFirebaseStorage() {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured.');
  storagePromise ??= import('firebase/storage').then(({ connectStorageEmulator, getStorage }) => {
    const instance = getStorage(app);
    if (emulatorMode) connectStorageEmulator(instance, '127.0.0.1', 9199);
    return instance;
  });
  return storagePromise;
}

export { app, auth };
