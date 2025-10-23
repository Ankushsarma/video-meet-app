ideo Chat Application with PeerJS and Socket.io
This is a simple, real-time video chat application built using Node.js with Express, Socket.io for signaling, and PeerJS for WebRTC peer-to-peer connections.

🚀 Features
Real-Time Video/Audio Chat: Connects multiple users in a single room for live communication.

Dynamic Room Support: Users are routed to a default main-room but the architecture supports multiple rooms.

Media Toggling: Users can toggle their camera and microphone on and off.

Peer-to-Peer Connections: Utilizes WebRTC via PeerJS for direct media transmission between clients.

User Status Updates: Notifies users when peers connect or disconnect.

🛠️ Technology Stack
Backend: Node.js, Express

Real-Time: Socket.io

P2P/WebRTC: PeerJS

Templating: EJS

📝 Setup and Installation
Prerequisites
Node.js (LTS recommended)

npm or yarn

1. Server Setup
Assuming your server code is in a file named server.js and the frontend code is linked in an EJS view in a folder structure like:

.
├── node_modules/
├── public/
│   └── (css, js, etc. static files)
├── views/
│   └── room.ejs
├── package.json
└── server.js
Install Dependencies:

Bash

npm install express socket.io ejs
(Note: PeerJS is loaded on the client-side via a CDN in the provided code, so no server-side package is strictly needed for PeerJS.)

Ensure File Structure: Make sure you have the views/room.ejs file and any necessary static files (like your client-side JavaScript, potentially named client.js or similar) in the public directory.

Run the Server:

Bash

node server.js
2. Client Setup
The client-side code provided needs to be executed within a browser. It is assumed to be included in the EJS template (room.ejs).

The client code makes use of Socket.io client library and PeerJS library, which must be included in your HTML/EJS file, typically via CDNs:

HTML

<script src="/socket.io/socket.io.js"></script>
<script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
<script src="/path/to/your/client-script.js" defer></script>
🧑‍💻 How to Use
Start the Server: Execute node server.js.

Access the Application: Open your web browser and navigate to http://localhost:3000.

Join the Room: The application will automatically redirect you to the default room (/main-room).

Connect Peers: Open the same URL in another browser tab, window, or device to connect multiple users.

Control Media: Use the "Turn Off Camera" and "Mute" buttons to toggle your video and microphone respectively.

🔑 Key Components
Server (server.js)
Express and HTTP Server: Sets up the basic web server.

Socket.io: Initializes the real-time communication layer.

Room Management: Uses a simple ROOM_ID ("main-room") and a usersInRoom Set to track connected users.

Socket Events:

join-room: Handles a new user joining, sends existing users, and notifies others.

disconnect: Removes the user from the set and notifies peers.

camera-toggle / mic-toggle: Broadcasts media state changes to all other users in the room.

Client (Frontend JavaScript)
Socket.io Client: Connects to the server.

PeerJS: Initializes the peer connection with a unique ID (myUserId).

Media Access: Uses navigator.mediaDevices.getUserMedia to get the local video and audio stream.

Call Handling:

Outgoing Calls: The connectToUser function uses myPeer.call(userId, stream) to call existing or newly connected users.

Incoming Calls: myPeer.on("call", ...) handles calls from other peers and answers with the local stream.

User Management:

existing-users / user-connected: Triggers the call setup process (connectToUser).

user-disconnected: Closes the peer connection and removes the video element.

UI/Media Toggles: Updates the local stream track state and emits the camera-toggle or mic-toggle event to the server.

Remote Media Toggles: The camera-toggled listener handles remote state changes by either displaying the video or a "Camera Off" placeholder.
