const createGameBtn = document.getElementById("createGameBtn");
if (createGameBtn) {
  createGameBtn.addEventListener("click", () => {
    window.location.href = "creater_screen.html";
  });
}

const joinGameBtn = document.getElementById("joinGameBtn");
if (joinGameBtn) {
    joinGameBtn.addEventListener("click", () => {
    window.location.href = "connection_screen.html";
  });
  console.log("Join game button clicked");
}

// Handle room creation (creater_screen.html)
const toLobbyBtn = document.getElementById("toLobbyBtn");
if (toLobbyBtn) {
  toLobbyBtn.addEventListener("click", async () => {
    // Import functions dynamically to avoid circular dependencies
    const { createRoom, joinRoom } = await import("./rooms.js");
    
    // Get user name from input
    const userNameInput = document.getElementById("userNameInput");
    const userName = userNameInput ? userNameInput.value.trim() : "";
    
    if (!userName) {
      alert("Пожалуйста, введите ваше имя");
      return;
    }
    
    try {
      // Create room in Firestore
      const roomData = await createRoom();
      
      // Add creator as host user in the room
      const hostUserId = await joinRoom(roomData.roomId, userName, "host");
      
      // Log creation details
      console.log("Room created:", {
        roomId: roomData.roomId,
        roomCode: roomData.code,
        hostUserId: hostUserId,
        hostName: userName
      });
      
      // Store room data for use in lobby
      sessionStorage.setItem("roomId", roomData.roomId);
      sessionStorage.setItem("roomCode", roomData.code);
      
      console.log("Room created, redirecting to lobby");
      window.location.href = "lobby.html";
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Ошибка при создании комнаты. Попробуйте еще раз.");
    }
  });
  console.log("Create room button handler initialized");
}

// Handle room connection (connection_screen.html)
const connectRoomForm = document.getElementById("connectRoomForm");
const connectRoomBtn = document.getElementById("connectRoomBtn");

if (connectRoomForm && connectRoomBtn) {
  // Prevent default form submission
  connectRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });
  
  // Handle button click
  connectRoomBtn.addEventListener("click", async () => {
    // Import functions dynamically to avoid circular dependencies
    const { findRoomByCode, joinRoom } = await import("./rooms.js");
    
    // Get user inputs
    const userNameInput = document.getElementById("connectUserNameInput");
    const roomCodeInput = document.getElementById("roomCodeInput");
    
    const userName = userNameInput ? userNameInput.value.trim() : "";
    const roomCode = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : "";
    
    if (!userName || !roomCode) {
      console.log("Missing user name or room code");
      return;
    }
    
    try {
      // Find room by code
      const roomId = await findRoomByCode(roomCode);
      
      if (!roomId) {
        console.log("Room not found with code:", roomCode);
        return;
      }
      
      // Join the room as a player
      const userId = await joinRoom(roomId, userName, "player");
      
      // Log connection details
      console.log("User connected to room:", {
        roomId: roomId,
        roomCode: roomCode,
        userId: userId,
        userName: userName
      });
      
      // Store room data for use in lobby
      sessionStorage.setItem("roomId", roomId);
      sessionStorage.setItem("roomCode", roomCode);
      
      // Redirect to lobby after successful join
      console.log("Redirecting to lobby");
      window.location.href = "lobby.html";
    } catch (error) {
      console.error("Error connecting to room:", error);
    }
  });
  console.log("Connect room button handler initialized");
}



const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

const readinessBtn = document.getElementById("readinessBtn");
if (readinessBtn) {
  readinessBtn.addEventListener("click", () => {
    const isReady = readinessBtn.classList.toggle("is-ready");
    readinessBtn.textContent = isReady ? "Готов" : "Не готов";
  });
}

// Display room code in lobby if available
const roomCodeElement = document.getElementById("roomCode");
if (roomCodeElement) {
  const roomCode = sessionStorage.getItem("roomCode");
  if (roomCode) {
    roomCodeElement.textContent = roomCode;
  }
}

// Initialize real-time users list in lobby
const usersListElement = document.getElementById("usersList");
if (usersListElement) {
  // Get roomId from sessionStorage (set when creating or joining a room)
  const roomId = sessionStorage.getItem("roomId");
  
  if (roomId) {
    // Import subscription function
    import("./subscriptions.js").then(({ subscribeToRoomUsers }) => {
      // Subscribe to users collection updates
      subscribeToRoomUsers(roomId, (users) => {
        // Clear existing list
        usersListElement.innerHTML = "";
        
        // Render each user
        users.forEach((user) => {
          const listItem = document.createElement("li");
          listItem.className = "player-item";
          listItem.textContent = user.name;
          usersListElement.appendChild(listItem);
        });
      });
    });
  } else {
    console.log("No roomId found in sessionStorage");
  }
}
