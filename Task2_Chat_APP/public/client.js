const socket = io();

// DOM Elements
const messages = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const chatWith = document.getElementById("chat-with");
const chatStatus = document.getElementById("chat-status");
const sendBtn = document.getElementById("sendBtn");
const attachBtn = document.getElementById("attach-btn");
const dropdown = document.getElementById("dropdown");
const imageInput = document.getElementById("imageInput");
const docInput = document.getElementById("docInput");
const recordBtn = document.getElementById("recordVoiceBtn");

let username = prompt("Enter your name") || "Anonymous";
chatWith.textContent = " "; // Placeholder until another user joins

// Emit "new user joined"
socket.emit("new user", username);

// Set status to typing
input.addEventListener("input", () => {
  socket.emit("typing", username);
});

// Enter to send message
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Toggle attachments menu
attachBtn.addEventListener("click", () => {
  dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
});

// Send text message
sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  socket.emit("chat message", { username, text: msg, time });
  input.value = "";
});

// Receive chat message
socket.on("chat message", (data) => {
  addMessage(data);
});

// New user joined
socket.on("new user", (name) => {
  chatWith.textContent = name === username ? "You" : `${name}`;
  chatStatus.textContent = "Online";
});

// User typing
socket.on("typing", (name) => {
  if (name !== username) {
    chatStatus.textContent = "Typing...";
    setTimeout(() => {
      chatStatus.textContent = "Online";
    }, 2000);
  }
});

// Last seen (when user leaves)
socket.on("user left", (time) => {
  chatStatus.textContent = `Last seen at ${time}`;
});

// Attach image
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    socket.emit("file message", {
      username,
      file: reader.result,
      filename: file.name,
      filetype: file.type,
      time,
    });
  };
  reader.readAsDataURL(file);
});

// Attach document
docInput.addEventListener("change", () => {
  const file = docInput.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    socket.emit("file message", {
      username,
      file: reader.result,
      filename: file.name,
      filetype: file.type,
      time,
    });
  };
  reader.readAsDataURL(file);
});

// Display file messages
socket.on("file message", (data) => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add(data.username === username ? "outgoing" : "incoming");

  if (data.filetype.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = data.file;
    img.alt = data.filename;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "12px";
    msgDiv.appendChild(img);
  } else {
    const link = document.createElement("a");
    link.href = data.file;
    link.download = data.filename;
    link.textContent = `📎 ${data.filename}`;
    link.target = "_blank";
    msgDiv.appendChild(link);
  }

  const span = document.createElement("span");
  span.textContent = `${data.username === username ? "You" : data.username} • ${data.time}`;
  msgDiv.appendChild(span);

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});


// Message display
function addMessage(data) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add(data.username === username ? "outgoing" : "incoming");

  msgDiv.innerHTML = `
    ${data.text}
    <span>${data.username === username ? "You" : data.username} • ${data.time}</span>
  `;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

let mediaRecorder;
let audioChunks = [];

recordBtn.addEventListener("click", async () => {
  // Ask for mic access
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          socket.emit("voice message", {
            username,
            audio: base64,
            time,
          });
        };
        reader.readAsDataURL(blob);
      };

      audioChunks = [];
      mediaRecorder.start();
      recordBtn.textContent = "⏹ Stop"; // toggle icon/text

      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          recordBtn.textContent = "🎤"; // reset
        }
      }, 60000); // auto stop at 60s

    } catch (err) {
      alert("Microphone access denied or unavailable.");
      console.error(err);
    }

  } else if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤";
  }
});

socket.on("voice message", (data) => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add(data.username === username ? "outgoing" : "incoming");

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = data.audio;

  msgDiv.appendChild(audio);

  const span = document.createElement("span");
  span.textContent = `${data.username === username ? "You" : data.username} • ${data.time}`;
  msgDiv.appendChild(span);

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});


