import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase Initialization Failed:", e);
  // Emergency fallbacks to prevent crash
  app = { options: firebaseConfig } as any;
  db = {} as any;
  auth = { currentUser: null, onAuthStateChanged: () => () => {} } as any;
}

export { app, db, auth };
