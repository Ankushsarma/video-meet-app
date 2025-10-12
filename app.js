const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const ROOM_ID = "main-room";
const usersInRoom = new Set();

app.get("/", (req, res) => res.redirect(`/${ROOM_ID}`));
app.get("/:roomId", (req, res) => res.render("room", { roomId: req.params.roomId }));

io.on("connection", socket => {
  socket.on("join-room", userId => {
    socket.join(ROOM_ID);

    // Send existing users to the new user
    const existingUsers = Array.from(usersInRoom);
    socket.emit("existing-users", existingUsers);

    // Notify others
    socket.to(ROOM_ID).emit("user-connected", userId);

    usersInRoom.add(userId);

    socket.on("disconnect", () => {
      usersInRoom.delete(userId);
      socket.to(ROOM_ID).emit("user-disconnected", userId);
    });

    socket.on("camera-toggle", (userId, isOn) => {
      socket.to(ROOM_ID).emit("camera-toggled", userId, isOn);
    });

    socket.on("mic-toggle", (userId, isOn) => {
      socket.to(ROOM_ID).emit("mic-toggled", userId, isOn);
    });
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
