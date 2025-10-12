const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

// Root route → render a single global session
app.get("/", (req, res) => {
  res.render("room");
});

// WebSocket logic (all users in "global" session)
const users = new Set();

io.on("connection", socket => {
  users.forEach(userId => {
    socket.emit("user-connected", userId); // let new user know about existing users
  });

  users.add(socket.id);
  socket.broadcast.emit("user-connected", socket.id); // tell others new user joined

  socket.on("disconnect", () => {
    users.delete(socket.id);
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
