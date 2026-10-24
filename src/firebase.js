import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  connectFirestoreEmulator
} from 'firebase/firestore';

// When true, the app talks to the local Auth + Firestore emulators instead of
// a real project — used by the automated sync tests. Any real deployment
// leaves this unset and supplies the VITE_FIREBASE_* values below.
const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === '1';

// Real project config comes from build-time env vars (see .env.example). The
// emulator needs only a project id, so a demo one is filled in for that path.
const firebaseConfig = USE_EMULATOR
  ? { apiKey: 'demo-key', projectId: 'demo-budget', authDomain: 'demo-budget.firebaseapp.com' }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

// A missing config is the most common first-run mistake, so fail loudly with a
// pointer rather than letting Firebase throw an opaque error deeper in.
export const firebaseConfigured = USE_EMULATOR || Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // persistentLocalCache keeps the last synced data on the device, so the app
  // opens instantly and keeps working offline; writes queue and flush on
  // reconnect. Single-tab manager avoids the multi-tab coordination overhead a
  // budget app doesn't need.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
  });

  if (USE_EMULATOR) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
}

export { app, auth, db, USE_EMULATOR };
