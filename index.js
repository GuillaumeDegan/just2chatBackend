// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // autoriser tous les domaines pendant le dev
    methods: ["GET", "POST"],
  },
});
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Un utilisateur est connecté :", socket.id);

  socket.on("user-connected", (userId) => {
    console.log("use state connected", userId);
    connectedUsers.set(userId, socket.id);
    const onlineUsers = [...connectedUsers.keys()];
    io.emit("users-status", onlineUsers);
  });

  socket.on("send-message", ({ message, senderId }) => {
    console.log("msg received in backend", message);
    socket.broadcast.emit("receive-message", {
      message: message,
      senderId: senderId,
      id: socket.id,
    });
  });

  socket.on("typing", (userId) => {
    console.log("User is typing:", userId);
    socket.broadcast.emit("user-typing", userId);
  });

  socket.on("stop-typing", (userId) => {
    console.log("User stopped typing:", userId);
    socket.broadcast.emit("user-stopped-typing", userId);
  });

  socket.on("user-disconnected", (userId) => {
    console.log("state: disconnected", userId);
    connectedUsers.delete(userId);
    const onlineUsers = [...connectedUsers.keys()];

    io.emit("users-status", onlineUsers);
  });

  socket.on("disconnect", () => {
    console.log("❌ Utilisateur déconnecté :", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Serveur en écoute sur http://localhost:3001");
});
