import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let authInstance = null;
let googleProviderInstance = null;
let firebaseInitError = null;

try {
  const isConfigComplete =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId;

  if (!isConfigComplete) {
    throw new Error('Firebase configuration is incomplete. Add VITE_FIREBASE_* entries to frontend/.env');
  }

  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
} catch (error) {
  console.error('Firebase initialization failed:', error);
  firebaseInitError = error;
}

export const auth = authInstance;
export const googleProvider = googleProviderInstance;
export const firebaseReady = Boolean(authInstance && googleProviderInstance);
export const firebaseError = firebaseInitError;
export default app;
