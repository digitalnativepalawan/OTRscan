
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCP32SHT2-pl9VlxWqjL-voyUczCppJ6PQ",
  authDomain: "palawan-collective-console.firebaseapp.com",
  databaseURL: "https://palawan-collective-console-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "palawan-collective-console",
  storageBucket: "palawan-collective-console.firebasestorage.app",
  messagingSenderId: "738243500004",
  appId: "1:738243500004:web:39e31280f3f78189eed9f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
