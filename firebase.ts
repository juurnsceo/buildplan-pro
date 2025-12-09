
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
// 1. Go to console.firebase.google.com
// 2. Create a project
// 3. Register a Web App
// 4. Copy the "firebaseConfig" object and replace the one below
// 5. Go to "Firestore Database" in the console and click "Create Database"
// 6. Select "Start in Test Mode" so you can read/write without auth rules for now
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "replace-with-your-project.firebaseapp.com",
  projectId: "replace-with-your-project",
  storageBucket: "replace-with-your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Check if the user has replaced the placeholder
export const isConfigured = firebaseConfig.projectId !== "replace-with-your-project";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
