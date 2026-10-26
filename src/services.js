import { firebaseReadyForApp, getFirebaseFunctions } from './firebase.js';

export async function callTownTap(name, data = {}) {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured. Start the local emulators to use this feature.');
  const [{ httpsCallable }, functions] = await Promise.all([
    import('firebase/functions'),
    getFirebaseFunctions(),
  ]);
  const callable = httpsCallable(functions, name);
  const response = await callable(data);
  return response.data;
}
