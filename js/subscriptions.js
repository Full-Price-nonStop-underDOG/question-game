import { db } from "./firebase.js";
import {
  doc,
  onSnapshot
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function subscribeToRoom(roomId) {
    const roomRef = doc(db, "rooms", roomId);
  
    onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("Room does not exist");
        return;
      }
  
      const data = snapshot.data();
      console.log("ROOM UPDATE:", data);
    });
  }

export { subscribeToRoom };
