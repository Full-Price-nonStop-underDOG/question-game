// Firebase core
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firestore
import {
  getFirestore
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration (из Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyB1gMNB1xesq7mHTlGunEYV9T63Pyab6UQ",
    authDomain: "question-app-6efb5.firebaseapp.com",
    projectId: "question-app-6efb5",
    storageBucket: "question-app-6efb5.firebasestorage.app",
    messagingSenderId: "386610108906",
    appId: "1:386610108906:web:9f5c1a714a184e009bba93"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export db for further use
export { db };

console.log("Firebase initialized");
