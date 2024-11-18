const WebSocket = require('ws');
const http = require('http');

// 建立 HTTP 伺服器
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 心跳機制參數
const HEARTBEAT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = HEARTBEAT_INTERVAL * 3;

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.isAlive = true;
    ws.lastPing = Date.now();

    // 接收客戶端訊息
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'pong') {
            ws.isAlive = true;
            ws.lastPing = Date.now();
        } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate') {
            console.log(`Received signaling: ${data.type}`);
            // 廣播給其他客戶端
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } else {
            console.log('Received unknown message:', data);
        }
    });

    // 處理客戶端斷開連線
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // 傳送確認連線訊息
    ws.send(JSON.stringify({ type: 'connected', content: 'Successfully connected to server' }));
});

// 心跳機制
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('Connection timeout');
            return ws.terminate();
        }

        if (Date.now() - ws.lastPing > CONNECTION_TIMEOUT) {
            console.log('Heartbeat timeout');
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.send(JSON.stringify({ type: 'ping' }));
    });
}, HEARTBEAT_INTERVAL);

// 啟動伺服器
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WebSocket signaling server is running on port ${PORT}`);
});