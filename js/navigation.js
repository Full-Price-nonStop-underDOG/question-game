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

const toLobbyBtn = document.getElementById("toLobbyBtn");
if (toLobbyBtn) {
    toLobbyBtn.addEventListener("click", () => {
    window.location.href = "lobby.html";
  });
  console.log("Join game");
 
}



const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
