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
      // Import required modules
      const { updateRoomStatus } = await import("./rooms.js");
      const { assignTasksToRoom } = await import("./taskAssignment.js");
      
      // Assign tasks to all users in the room (runs once, checks for existing assignments)
      await assignTasksToRoom(roomId);
      
      // Update room status to 'active' in Firestore (triggers navigation for all clients)
      await updateRoomStatus(roomId, "active");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  });
}

// Game screen: Load and render player tasks
const tasksContainer = document.getElementById("tasksContainer");
const confirmationArea = document.getElementById("confirmationArea");
const confirmationMessage = document.querySelector(".confirmation-message");

if (tasksContainer) {
  const roomId = sessionStorage.getItem("roomId");
  const userId = sessionStorage.getItem("userId");
  
  if (roomId && userId) {
    // Load user tasks from Firestore
    (async () => {
      try {
        const { db } = await import("./firebase.js");
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        // Load user document with tasks
        const userRef = doc(db, "rooms", roomId, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const tasks = userData.tasks || [];
          
          if (tasks.length === 0) {
            console.log("No tasks assigned yet");
            tasksContainer.innerHTML = "<p>Задания еще не назначены</p>";
            return;
          }
          
          // Clear container
          tasksContainer.innerHTML = "";
          
          // Validate tasks array completeness
          if (tasks.length !== 3) {
            console.error(`Expected 3 tasks, but found ${tasks.length} tasks`);
            tasksContainer.innerHTML = `<p>Ошибка: найдено ${tasks.length} заданий вместо 3</p>`;
            return;
          }
          
          // Validate all tasks before rendering
          const validTasks = [];
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            
            // Validate task structure
            if (!task || typeof task !== "object") {
              console.error(`Invalid task at index ${index}:`, task);
              continue;
            }
            
            if (!task.taskText || typeof task.taskText !== "string" || task.taskText.trim() === "") {
              console.error(`Task at index ${index} missing or invalid taskText:`, task);
              continue;
            }
            
            if (!task.targetName || typeof task.targetName !== "string" || task.targetName.trim() === "") {
              console.error(`Task at index ${index} missing or invalid targetName:`, task);
              continue;
            }
            
            validTasks.push({ task, index });
          }
          
          // Ensure we have exactly 3 valid tasks
          if (validTasks.length !== 3) {
            console.error(`Expected 3 valid tasks, but found ${validTasks.length} valid tasks out of ${tasks.length} total`);
            tasksContainer.innerHTML = `<p>Ошибка: найдено ${validTasks.length} валидных заданий вместо 3</p>`;
            return;
          }
          
          // Render each valid task as a button
          validTasks.forEach(({ task, index }) => {
            // CRITICAL: Extract taskId from task object (Firestore docId, e.g., "task-17")
            const taskId = task.taskId;
            if (!taskId) {
              console.error(`[TASK_RENDER] Task at index ${index} missing taskId:`, task);
              return;
            }
            
            const button = document.createElement("button");
            button.className = "task-button";
            button.setAttribute("data-task-index", index);
            // Store taskId for future reference (e.g., completion tracking)
            button.setAttribute("data-task-id", taskId);
            
            // Generate display label (UI-only, never stored in Firestore)
            // Replace generic terms in task text with actual target name
            // Example: "Заставь другого человека назвать овощ" -> "Заставь Bob назвать овощ"
            let taskText = task.taskText.trim();
            const targetName = task.targetName.trim();
            
            // Replace common generic terms with actual target name
            // Order matters: more specific patterns first
            taskText = taskText
              .replace(/другого человека/gi, targetName)
              .replace(/другого игрока/gi, targetName)
              .replace(/кого-то/gi, targetName)
              .replace(/человека/gi, targetName)
              .replace(/игрока/gi, targetName);
            
            // Ensure target name is visible - if replacement didn't work, append it
            // This is a fallback to guarantee target name is always shown
            if (!taskText.includes(targetName)) {
              taskText = `${taskText} (${targetName})`;
            }
            
            // Display label is computed here and only used for UI
            const displayLabel = taskText; // This is "Task N (PlayerName)" format
            
            // Log taskId vs displayLabel for debugging
            console.log(`[TASK_RENDER] Rendering task. taskId="${taskId}", displayLabel="${displayLabel}"`);
            
            button.textContent = displayLabel;
            tasksContainer.appendChild(button);
          });
          
          // Verify all tasks were rendered
          const renderedButtons = tasksContainer.querySelectorAll(".task-button");
          if (renderedButtons.length !== 3) {
            console.error(`Expected to render 3 task buttons, but rendered ${renderedButtons.length}`);
            tasksContainer.innerHTML = `<p>Ошибка: отображено ${renderedButtons.length} заданий вместо 3</p>`;
            return;
          }
          
          // Attach click handlers to dynamically created buttons
          const taskButtons = tasksContainer.querySelectorAll(".task-button");
          if (taskButtons.length > 0 && confirmationArea && confirmationMessage) {
            taskButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const taskIndex = parseInt(button.getAttribute("data-task-index"));
                const taskId = button.getAttribute("data-task-id"); // Firestore docId
                const task = tasks[taskIndex];
                const displayLabel = button.textContent; // UI-only label
                
                if (task) {
                  // Log that we're using taskId, not displayLabel, for identification
                  console.log(`[TASK_CLICK] Task clicked. taskId="${taskId}", displayLabel="${displayLabel}"`);
                  
                  // Update confirmation message with display label (UI-only)
                  confirmationMessage.textContent = `Вы выполнили задание: "${displayLabel}"?`;
                  
                  // Store taskId in confirmation area for future completion tracking
                  // (if needed for writing completedAt timestamps)
                  confirmationArea.setAttribute("data-selected-task-id", taskId);
                  
                  // Show confirmation area
                  confirmationArea.classList.remove("hidden");
                }
              });
            });
          }
          
          // Log taskIds loaded (for debugging)
          const loadedTaskIds = tasks.map(t => t.taskId).filter(Boolean);
          console.log(`[TASK_LOAD] Loaded ${tasks.length} tasks. taskIds:`, loadedTaskIds);
        } else {
          console.log("User document not found");
          tasksContainer.innerHTML = "<p>Данные пользователя не найдены</p>";
        }
      } catch (error) {
        console.error("Error loading user tasks:", error);
        if (tasksContainer) {
          tasksContainer.innerHTML = "<p>Ошибка загрузки заданий</p>";
        }
      }
    })();
  } else {
    console.log("Missing roomId or userId");
    if (tasksContainer) {
      tasksContainer.innerHTML = "<p>Не удалось определить комнату или пользователя</p>";
    }
  }
}

// Confirmation buttons handlers
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

if (confirmYes) {
  confirmYes.addEventListener("click", async () => {
    // Get taskId from confirmation area (stored when task button was clicked)
    const taskId = confirmationArea?.getAttribute("data-selected-task-id");
    
    if (!taskId) {
      console.error("[TASK_COMPLETE] No taskId found in confirmation area");
      return;
    }
    
    // CRITICAL: Use taskId (Firestore docId), never display labels
    console.log(`[TASK_COMPLETE] Task completion confirmed. taskId="${taskId}"`);
    
    // TODO: Future implementation - write completedAt timestamp to Firestore
    // Example:
    // const roomId = sessionStorage.getItem("roomId");
    // const userId = sessionStorage.getItem("userId");
    // const userRef = doc(db, "rooms", roomId, "users", userId);
    // const userDoc = await getDoc(userRef);
    // const tasks = userDoc.data().tasks || [];
    // const taskIndex = tasks.findIndex(t => t.taskId === taskId);
    // if (taskIndex >= 0) {
    //   const taskPath = `tasks.${taskIndex}.completedAt`;
    //   await updateDoc(userRef, { [taskPath]: serverTimestamp() });
    // }
    
    // Hide confirmation area
    if (confirmationArea) {
      confirmationArea.classList.add("hidden");
      confirmationArea.removeAttribute("data-selected-task-id");
    }
  });
}

if (confirmNo) {
  confirmNo.addEventListener("click", () => {
    // Hide confirmation area
    if (confirmationArea) {
      confirmationArea.classList.add("hidden");
    }
  });
}
