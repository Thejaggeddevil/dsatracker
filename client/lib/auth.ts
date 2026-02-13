import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./firebase";

// EMAIL SIGNUP
export async function signup(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// EMAIL LOGIN
export async function login(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// LOGOUT
export function logout() {
  return signOut(auth);
}

// AUTH STATE
export function listenAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// GOOGLE LOGIN
const googleProvider = new GoogleAuthProvider();
export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// GITHUB LOGIN
const githubProvider = new GithubAuthProvider();
export function loginWithGithub() {
  return signInWithPopup(auth, githubProvider);
}
