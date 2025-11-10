const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a conversation room
    socket.on("join-conversation", ({ courseId, userId }) => {
      const room = `course-${courseId}`;
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });

    // Leave a conversation room
    socket.on("leave-conversation", ({ courseId }) => {
      const room = `course-${courseId}`;
      socket.leave(room);
      console.log(`User left room: ${room}`);
    });

    // Handle typing indicator
    socket.on("typing", ({ courseId, userName }) => {
      const room = `course-${courseId}`;
      socket.to(room).emit("user-typing", { userName });
    });

    socket.on("stop-typing", ({ courseId }) => {
      const room = `course-${courseId}`;
      socket.to(room).emit("user-stopped-typing");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

// Emit new message to room
function emitNewMessage(courseId, message) {
  if (io) {
    const room = `course-${courseId}`;
    io.to(room).emit("new-message", message);
    console.log(`Emitted message to room: ${room}`);
  }
}

// Emit revenue update to all connected clients (or specific instructor)
function emitRevenueUpdate(data) {
  if (io) {
    io.emit("revenue-update", data);
    console.log(`Revenue update emitted for instructor ${data.instructorId}`);
  }
}

module.exports = { initializeSocket, getIO, emitNewMessage, emitRevenueUpdate };
