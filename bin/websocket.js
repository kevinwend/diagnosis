const WebSocket = require('ws');

const HEARTBEAT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = HEARTBEAT_INTERVAL * 3;

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        // console.log('Client connected');
        ws.isAlive = true;
        ws.lastPing = Date.now();


        ws.on('message', (message) => {
            const data = JSON.parse(message);

            if (data.type === 'pong') {
                ws.isAlive = true;
                ws.lastPing = Date.now();
            } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate') {
                // console.log(`Received signaling: ${data.type}`);

                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            } else {
                // console.log('Received unknown message:', data);
            }
        });

        ws.on('close', () => {
            // console.log('Client disconnected');
        });

        ws.send(JSON.stringify({ type: 'connected', content: 'Successfully connected to server' }));
    });

    setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                // console.log('Connection timeout');
                return ws.terminate();
            }

            if (Date.now() - ws.lastPing > CONNECTION_TIMEOUT) {
                // console.log('Heartbeat timeout');
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.send(JSON.stringify({ type: 'ping' }));
        });
    }, HEARTBEAT_INTERVAL);

    // console.log('WebSocket server is running');

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
}

module.exports = setupWebSocket;