// FIX: Updated to Firebase v9 modular syntax to resolve import errors.
// The original code used v8 syntax, but the error suggests v9+ is installed.
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// IMPORTANT: Replace with your app's Firebase project configuration
// You can get this from the Firebase console for your project.
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Initialize Firebase
// FIX: Property 'initializeApp' does not exist on type 'typeof firebase'. Using Firebase v9 syntax.
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
// FIX: Property 'storage' does not exist on type 'typeof firebase'. Using Firebase v9 syntax.
export const storage = getStorage(app);
