// FIX: Updated to Firebase v8 syntax to resolve module export error.
// The project likely uses an older version of the Firebase SDK.
import firebase from "firebase/app";
import "firebase/storage";

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
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = firebase.storage();
