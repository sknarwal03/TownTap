import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

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
let db;
let functions;
let storage;

if (firebaseReadyForApp) {
  app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, 'us-central1');
  storage = getStorage(app);

  if (emulatorMode) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

export { app, auth, db, functions, storage };
