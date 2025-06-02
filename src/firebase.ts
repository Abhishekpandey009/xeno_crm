// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8qm8_-3P_JXEwPXUYjOXwYS42kqYjx0s",
  authDomain: "xeno-crm-abhishek.firebaseapp.com",
  projectId: "xeno-crm-abhishek",
  storageBucket: "xeno-crm-abhishek.appspot.com",
  messagingSenderId: "184738196562",
  appId: "1:184738196562:web:284d27d114f7f12ae4838b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
