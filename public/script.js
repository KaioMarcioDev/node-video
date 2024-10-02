const socket = io.connect('/');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream, remoteStream, peerConnection;

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Servidor STUN
    ]
};

// Captura o vídeo local
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;
        startPeerConnection();
    });

socket.on('offer', (data) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    peerConnection.createAnswer().then(answer => {
        peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });
});

socket.on('answer', (data) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(data));
});

socket.on('candidate', (data) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(data));
});

function startPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);
    });
}
