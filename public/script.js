const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const toggleCameraBtn = document.getElementById("toggleCamera");
const toggleMicBtn = document.getElementById("toggleMic");

const myUserId = Math.random().toString(36).substring(2,10);
const peers = {};
const videoElements = {};

let myStream;
let cameraOn = true;
let micOn = true;

// Initialize PeerJS with own ID
const myPeer = new Peer(myUserId, {
  host: "0.peerjs.com",
  port: 443,
  secure: true
});

// Once PeerJS is ready, join the room
myPeer.on("open", id => {
  socket.emit("join-room", id);
});

// Get user media
navigator.mediaDevices.getUserMedia({ video:true, audio:true })
  .then(stream => {
    myStream = stream;
    addVideo(myUserId, stream, true); // add own video

    // Handle incoming calls
    myPeer.on("call", call => {
      call.answer(stream);
      const video = createVideoElement(call.peer);
      call.on("stream", userStream => replaceVideo(call.peer, userStream));
      peers[call.peer] = call;
    });
  })
  .catch(err => {
    addPlaceholder(myUserId);
    console.log("Camera unavailable:", err);
  });

// When existing users list arrives
socket.on("existing-users", users => {
  users.forEach(userId => {
    if(userId !== myUserId && myStream) connectToUser(userId, myStream);
  });
});

// When a new user joins
socket.on("user-connected", userId => {
  if(userId !== myUserId && myStream) connectToUser(userId, myStream);
});

// When a user disconnects
socket.on("user-disconnected", userId => {
  if(peers[userId]) peers[userId].close();
  if(videoElements[userId]) videoElements[userId].remove();
});

// Handle remote camera toggle
socket.on("camera-toggled", (userId, isOn) => {
  if(userId === myUserId) return; // skip self
  if(!videoElements[userId]) return;
  if(isOn) {
    if(peers[userId] && peers[userId].remoteStream)
      replaceVideo(userId, peers[userId].remoteStream);
  } else {
    replaceWithPlaceholder(userId);
  }
});

// Handle remote mic toggle (optional)
socket.on("mic-toggled", (userId, isOn) => {
  // Can add mute icon if needed
});

// --- Toggle buttons ---
toggleCameraBtn.addEventListener("click", () => {
  if(!myStream) return;
  cameraOn = !cameraOn;
  myStream.getVideoTracks()[0].enabled = cameraOn;
  toggleCameraBtn.textContent = cameraOn ? "Turn Off Camera" : "Turn On Camera";
  socket.emit("camera-toggle", myUserId, cameraOn);
});

toggleMicBtn.addEventListener("click", () => {
  if(!myStream) return;
  micOn = !micOn;
  myStream.getAudioTracks()[0].enabled = micOn;
  toggleMicBtn.textContent = micOn ? "Mute" : "Unmute";
  socket.emit("mic-toggle", myUserId, micOn);
});

// --- Helper functions ---
function connectToUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = createVideoElement(userId);
  call.on("stream", userStream => replaceVideo(userId, userStream));
  call.on("close", () => {
    if(videoElements[userId]) videoElements[userId].remove();
  });
  peers[userId] = call;
}

function addVideo(userId, stream, muted=false) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = muted;
  videoElements[userId] = video;
  videoGrid.append(video);
}

function createVideoElement(userId) {
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  videoElements[userId] = video;
  videoGrid.append(video);
  return video;
}

function replaceVideo(userId, stream) {
  const existing = videoElements[userId];
  if(existing && existing.tagName === "VIDEO") {
    existing.srcObject = stream;
  } else {
    if(existing) existing.remove();
    addVideo(userId, stream);
  }
}

function addPlaceholder(userId) {
  const placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = "Camera Off";
  videoElements[userId] = placeholder;
  videoGrid.append(placeholder);
}

function replaceWithPlaceholder(userId) {
  const existing = videoElements[userId];
  if(existing && existing.tagName === "VIDEO") existing.remove();
  else if(existing && existing.className === "placeholder") return;
  addPlaceholder(userId);
}
