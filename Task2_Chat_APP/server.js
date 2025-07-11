const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public"))); // Place your index.html & style.css inside /public

let users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When user joins with name
  socket.on("new user", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);

    // Broadcast new user to all others
    socket.broadcast.emit("new user", username);

    // Send to self as well
    socket.emit("new user", username);
  });

  // Handle message
  socket.on("chat message", (data) => {
    console.log("Message received:", data);
    io.emit("chat message", data); // Broadcast to everyone
  });

  // Handle file message (image, doc)
  socket.on("file message", (data) => {
    console.log("File sent:", data.filename);
    io.emit("file message", data); // Broadcast
  });

  //Handle voice messaging
  socket.on("voice message", (data) => {
    io.emit("voice message", data);
  });


  // Typing
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    const lastSeen = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    io.emit("user left", lastSeen);
    console.log(`${username} disconnected.`);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
