
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

  apiKey: "AIzaSyCllkCuE2bTju7WN1UN9eMnDWRgL7_-eto",

  authDomain: "buildplan-pro.firebaseapp.com",

  projectId: "buildplan-pro",

  storageBucket: "buildplan-pro.firebasestorage.app",

  messagingSenderId: "181069608174",

  appId: "1:181069608174:web:4506f5b1b5a16b875e6fff"

};



// Check if the user has replaced the placeholder
export const isConfigured = firebaseConfig.projectId !== "replace-with-your-project";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
