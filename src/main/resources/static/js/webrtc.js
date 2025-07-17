// DOM Elements
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const localIdInp = document.getElementById("localId");
const connectBtn = document.getElementById("connectBtn");
const remoteIdInp = document.getElementById("remoteId");
const callBtn = document.getElementById("callBtn");
const testConnection = document.getElementById("testConnection");

// Variables
let localStream;
let remoteStream;
let localPeer;
let remoteID;
let localID;
let stompClient;

// ICE Server Configurations
const iceServers = {
    iceServers: [{
        urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302'
        ]
    },
    {
        urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }]
};

// Initialize peer connection
localPeer = new RTCPeerConnection(iceServers);

// Request media permissions
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        console.log("Local media stream initialized successfully");
    })
    .catch(error => {
        console.error("Error accessing media devices:", error);
    });

// Connect to WebSocket server
connectBtn.onclick = () => {
    // Connect to Websocket Server
    var socket = new SockJS('http://localhost:8080/websocket');
    stompClient = Stomp.over(socket);
    localID = localIdInp.value;
    console.log("My ID: " + localID);
    
    stompClient.connect({}, frame => {
        console.log("Connected to WebSocket server:", frame);

        // Subscribe to testing URL
        stompClient.subscribe('/topic/testServer', function(test) {
            console.log('Test response received: ' + test.body);
        });

        // Subscribe to call notifications
        stompClient.subscribe('/user/' + localID + "/topic/call", (call) => {
            console.log("Call received from: " + call.body);
            remoteID = call.body;
            
            // Handle remote track
            localPeer.ontrack = (event) => {
                remoteVideo.srcObject = event.streams[0];
                console.log("Remote track added to video element");
            };

            // Handle ICE candidates
            localPeer.onicecandidate = (event) => {
                if (event.candidate) {
                    var candidate = {
                        type: "candidate",
                        lable: event.candidate.sdpMLineIndex,
                        id: event.candidate.candidate,
                    };
                    console.log("Sending ICE candidate");
                    
                    stompClient.send("/app/candidate", {}, JSON.stringify({
                        "toUser": call.body,
                        "fromUser": localID,
                        "candidate": candidate
                    }));
                }
            };

            // Add local tracks to peer connection
            localStream.getTracks().forEach(track => {
                localPeer.addTrack(track, localStream);
                console.log(`Added ${track.kind} track to peer connection`);
            });

            // Create and send offer
            localPeer.createOffer().then(description => {
                localPeer.setLocalDescription(description);
                console.log("Setting local description:", description);
                
                stompClient.send("/app/offer", {}, JSON.stringify({
                    "toUser": call.body,
                    "fromUser": localID,
                    "offer": description
                }));
            });
        });

        // Subscribe to offers
        stompClient.subscribe('/user/' + localID + "/topic/offer", (offer) => {
            console.log("Offer received");
            var o = JSON.parse(offer.body)["offer"];
            console.log("Offer details:", o);
            
            // Handle remote track
            localPeer.ontrack = (event) => {
                remoteVideo.srcObject = event.streams[0];
                console.log("Remote track added to video element");
            };
            
            // Handle ICE candidates
            localPeer.onicecandidate = (event) => {
                if (event.candidate) {
                    var candidate = {
                        type: "candidate",
                        lable: event.candidate.sdpMLineIndex,
                        id: event.candidate.candidate,
                    };
                    console.log("Sending ICE candidate");
                    
                    stompClient.send("/app/candidate", {}, JSON.stringify({
                        "toUser": remoteID,
                        "fromUser": localID,
                        "candidate": candidate
                    }));
                }
            };

            // Add local tracks to peer connection
            localStream.getTracks().forEach(track => {
                localPeer.addTrack(track, localStream);
                console.log(`Added ${track.kind} track to peer connection`);
            });

            // Set remote description and create answer
            localPeer.setRemoteDescription(new RTCSessionDescription(o))
                .then(() => {
                    console.log("Remote description set successfully");
                    return localPeer.createAnswer();
                })
                .then(description => {
                    localPeer.setLocalDescription(description);
                    console.log("Setting local description for answer");
                    
                    stompClient.send("/app/answer", {}, JSON.stringify({
                        "toUser": remoteID,
                        "fromUser": localID,
                        "answer": description
                    }));
                })
                .catch(error => {
                    console.error("Error creating answer:", error);
                });
        });

        // Subscribe to answers
        stompClient.subscribe('/user/' + localID + "/topic/answer", (answer) => {
            console.log("Answer received");
            var o = JSON.parse(answer.body)["answer"];
            console.log("Answer details:", o);
            
            localPeer.setRemoteDescription(new RTCSessionDescription(o))
                .then(() => {
                    console.log("Remote description set successfully for answer");
                })
                .catch(error => {
                    console.error("Error setting remote description:", error);
                });
        });

        // Subscribe to ICE candidates
        stompClient.subscribe('/user/' + localID + "/topic/candidate", (candidateMessage) => {
            console.log("ICE candidate received");
            var o = JSON.parse(candidateMessage.body)["candidate"];
            console.log("Candidate details:", o);
            
            var iceCandidate = new RTCIceCandidate({
                sdpMLineIndex: o["lable"],
                candidate: o["id"],
            });
            
            localPeer.addIceCandidate(iceCandidate)
                .then(() => {
                    console.log("ICE candidate added successfully");
                })
                .catch(error => {
                    console.error("Error adding ICE candidate:", error);
                });
        });

        // Register user
        stompClient.send("/app/addUser", {}, localID);
        console.log("User registered with ID:", localID);
    }, 
    error => {
        console.error("Error connecting to WebSocket server:", error);
    });
};

// Make a call to another user
callBtn.onclick = () => {
    remoteID = remoteIdInp.value;
    console.log("Calling user:", remoteID);
    stompClient.send("/app/call", {}, JSON.stringify({
        "callTo": remoteID, 
        "callFrom": localID
    }));
};

// Test WebSocket connection
testConnection.onclick = () => {
    console.log("Testing WebSocket connection");
    stompClient.send("/app/testServer", {}, "Testing server connection");
}; 