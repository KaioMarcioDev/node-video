const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manipulação dos eventos de WebRTC via Socket.IO
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Receber oferta e retransmitir
    socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    // Receber resposta e retransmitir
    socket.on('answer', (data) => {
        socket.broadcast.emit('answer', data);
    });

    // Receber e retransmitir ICE candidates
    socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
