import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Log the Firebase configuration to debug
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3 (only if site key is provided)
let appCheck;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'your-recaptcha-v3-site-key';
if (recaptchaSiteKey !== 'your-recaptcha-v3-site-key') {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true
  });
  console.log("App Check initialized with reCAPTCHA v3");
} else {
  console.log("App Check not initialized: Missing reCAPTCHA v3 site key");
}

const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
