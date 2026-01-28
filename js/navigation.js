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
      sessionStorage.setItem("userId", hostUserId);
      
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
      sessionStorage.setItem("userId", userId);
      
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
  readinessBtn.addEventListener("click", async () => {
    const roomId = sessionStorage.getItem("roomId");
    const userId = sessionStorage.getItem("userId");
    
    if (!roomId || !userId) {
      console.log("Missing roomId or userId");
      return;
    }
    
    // Toggle ready state
    const currentReady = readinessBtn.classList.contains("is-ready");
    const newReady = !currentReady;
    
    try {
      // Import update function
      const { updateUserReady } = await import("./rooms.js");
      
      // Update Firestore
      await updateUserReady(roomId, userId, newReady);
      
      // Update UI immediately (will also be updated via real-time subscription)
      if (newReady) {
        readinessBtn.classList.add("is-ready");
        readinessBtn.textContent = "Готов";
      } else {
        readinessBtn.classList.remove("is-ready");
        readinessBtn.textContent = "Не готов";
      }
    } catch (error) {
      console.error("Error updating ready state:", error);
    }
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
const startGameBtn = document.getElementById("startGameBtn");
if (usersListElement) {
  // Get roomId from sessionStorage (set when creating or joining a room)
  const roomId = sessionStorage.getItem("roomId");
  
  if (roomId) {
    // Import subscription functions
    import("./subscriptions.js").then(({ subscribeToRoomUsers, subscribeToRoom }) => {
      // Subscribe to users collection updates
      subscribeToRoomUsers(roomId, (users) => {
        // Clear existing list
        usersListElement.innerHTML = "";
        
        // Render each user
        users.forEach((user) => {
          const listItem = document.createElement("li");
          listItem.className = "player-item";
          
          // Add ready state class if user is ready
          if (user.ready === true) {
            listItem.classList.add("user-ready");
          }
          
          listItem.textContent = user.name;
          usersListElement.appendChild(listItem);
        });
        
        // Update ready button state based on current user
        const currentUserId = sessionStorage.getItem("userId");
        let isHost = false;
        let allReady = false;

        if (currentUserId) {
          const currentUser = users.find(u => u.id === currentUserId);

          if (currentUser) {
            // Determine if current user is host
            isHost = currentUser.role === "host";

            // Sync readiness button with current user state
            if (readinessBtn) {
              if (currentUser.ready) {
                readinessBtn.classList.add("is-ready");
                readinessBtn.textContent = "Готов";
              } else {
                readinessBtn.classList.remove("is-ready");
                readinessBtn.textContent = "Не готов";
              }
            }
          }
        }

        // Determine if all users are ready (and there is at least one user)
        if (users.length > 0) {
          allReady = users.every(u => u.ready === true);
        }

        // Show Start Game button only for host when all users are ready
        if (startGameBtn) {
          if (isHost && allReady) {
            startGameBtn.classList.remove("hidden");
          } else {
            startGameBtn.classList.add("hidden");
          }
        }
      });

      // Subscribe to room document to react to status changes (for all clients)
      subscribeToRoom(roomId, (roomData) => {
        if (!roomData) return;

        // If room is already active, or just became active, navigate to game
        if (roomData.status === "active") {
          // Prevent duplicate redirects
          if (!window.__roomNavigated) {
            window.__roomNavigated = true;
            window.location.href = "game.html";
          }
        }
      });
    });
  } else {
    console.log("No roomId found in sessionStorage");
  }
}

// Handle Start Game button click (host only, when visible)
if (startGameBtn) {
  startGameBtn.addEventListener("click", async () => {
    const roomId = sessionStorage.getItem("roomId");

    if (!roomId) {
      console.log("Missing roomId for Start Game");
      return;
    }

    try {
      // Update room status to 'active' in Firestore
      const { updateRoomStatus } = await import("./rooms.js");
      await updateRoomStatus(roomId, "active");
    } catch (error) {
      console.error("Error starting game (updating room status):", error);
    }
  });
}

// Game screen task button handlers
const taskButtons = document.querySelectorAll(".task-button");
const confirmationArea = document.getElementById("confirmationArea");
const confirmationMessage = document.querySelector(".confirmation-message");

if (taskButtons.length > 0 && confirmationArea && confirmationMessage) {
  taskButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const taskNumber = button.getAttribute("data-task");
      
      // Update confirmation message
      confirmationMessage.textContent = `Вы выполнили задание ${taskNumber}?`;
      
      // Show confirmation area
      confirmationArea.classList.remove("hidden");
    });
  });
  
  // Confirmation buttons (no action yet)
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");
  
  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      // Placeholder for future logic
      console.log("Task confirmed");
    });
  }
  
  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      // Hide confirmation area
      confirmationArea.classList.add("hidden");
    });
  }
}
