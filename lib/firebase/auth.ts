import {
  signInWithCredential,
  PhoneAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export async function verifyPhoneOTP(verificationId: string, otp: string) {
  const credential = PhoneAuthProvider.credential(verificationId, otp);
  return signInWithCredential(auth, credential);
}

export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signInWithApple(identityToken: string, nonce: string) {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
  return signInWithCredential(auth, credential);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}
