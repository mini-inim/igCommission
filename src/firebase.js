// firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,           // ✅ 수정됨
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,   // ✅ 수정됨
  projectId: process.env.REACT_APP_PROJECT_ID,     // ✅ 수정됨
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,  // ✅ 수정됨
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,  // ✅ 수정됨
  appId: process.env.REACT_APP_APP_ID,             // ✅ 수정됨
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ 여기서 모든 함수 export
export {
  db,
  auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};

// ✅ 기존 함수도 유지
export const loginEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
