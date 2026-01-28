import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

export { createRoom, joinRoom };
