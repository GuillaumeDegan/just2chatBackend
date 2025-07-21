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
    connectedUsers.set(userId, socket.id);
    const onlineUsers = [...connectedUsers.keys()];
    io.emit("users-status", onlineUsers);
  });

  socket.on("send-message", ({ messageId, message, senderId }) => {
    socket.broadcast.emit("receive-message", {
      message,
      senderId,
      id: messageId,
    });
  });

  socket.on("react-to-message", ({ messageId, reaction, senderId }) => {
    socket.broadcast.emit("message-reacted", {
      messageId,
      reaction,
      senderId,
    });
  });

  socket.on("typing", (userId) => {
    socket.broadcast.emit("user-typing", userId);
  });

  socket.on("stop-typing", (userId) => {
    socket.broadcast.emit("user-stopped-typing", userId);
  });

  socket.on("user-disconnected", (userId) => {
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
