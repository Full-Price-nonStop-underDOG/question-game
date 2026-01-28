import { db } from "./firebase.js";
import {
  doc,
  collection,
  onSnapshot
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Subscribe to room document (status, etc.)
function subscribeToRoom(roomId, onRoomUpdate) {
  const roomRef = doc(db, "rooms", roomId);

  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("Room does not exist");
      return;
    }

    const data = snapshot.data();
    console.log("ROOM UPDATE:", data);

    if (onRoomUpdate) {
      onRoomUpdate(data, snapshot);
    }
  });

  return unsubscribe;
}

// Subscribe to users collection in a room
function subscribeToRoomUsers(roomId, onUsersUpdate) {
  const usersRef = collection(db, "rooms", roomId, "users");
  
  const unsubscribe = onSnapshot(usersRef, (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.name || "",
        role: userData.role || "player",
        ready: userData.ready || false
      });
    });
    
    console.log("Users update:", users);
    onUsersUpdate(users);
  });
  
  return unsubscribe;
}

export { subscribeToRoom, subscribeToRoomUsers };
