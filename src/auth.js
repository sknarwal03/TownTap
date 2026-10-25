import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { auth, firebaseIsEmulated, firebaseReadyForApp } from './firebase.js';

let verifier;

export function requireAuthConfig() {
  if (!firebaseReadyForApp) throw new Error('Firebase is not configured. Start the local emulators for development.');
}

export async function requestPhoneCode(phoneNumber) {
  requireAuthConfig();
  if (verifier) verifier.clear();
  verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return { confirmation, emulated: firebaseIsEmulated };
}

export async function confirmPhoneCode(confirmation, code) {
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code.');
  const credential = await confirmation.confirm(code);
  return credential.user;
}

export async function signOutTownTap() {
  requireAuthConfig();
  if (verifier) verifier.clear();
  verifier = undefined;
  await signOut(auth);
}
