// Firebase core
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firestore
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
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

// createRoom

async function createRoom() {
  // создаём новый документ с авто-ID
  const roomRef = doc(collection(db, "rooms"));

  await setDoc(roomRef, {
    status: "waiting",
    createdAt: serverTimestamp(),
  });

  console.log("Room created with id:", roomRef.id);

  return roomRef.id;
}


async function joinRoom(roomId, userName) {
    const userRef = doc(
      collection(db, "rooms", roomId, "users")
    );
  
    await setDoc(userRef, {
      name: userName,
      joinedAt: serverTimestamp(),
    });
  
    console.log("User joined room:", userName, "→", roomId);
  
    return userRef.id;
  }

  async function main() {
    const roomId = await createRoom();
    await joinRoom(roomId, "Alice");
  }
  
  main();
  
  
