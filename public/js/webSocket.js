let ws = null;
let connectionStartTime = null;
let connectionEstablishedTime = null;
let connectionTimer = null;
let lastHeartbeat = null;

const wsConnectBtn = document.getElementById("wsConnectBtn");
const wsDisconnectBtn = document.getElementById("wsDisconnectBtn");
const wsConnectStatus = document.getElementById("wsConnectStatus");
const wsConnectTime = document.getElementById("wsConnectTime");
const wsConnectDuration = document.getElementById("wsConnectDuration");
const wsConnectLastHeartbeat = document.getElementById("wsConnectLastHeartbeat");

wsConnectLastHeartbeat.innerHTML = "-";

function updateConnectionDuration() {
  if (connectionEstablishedTime) {
    const duration = Math.floor(
      (Date.now() - connectionEstablishedTime) / 1000
    );
    wsConnectDuration.textContent = `${duration} seconds`;

    if (duration % 60 === 0 && duration <= 600) {
      collectedData["wsConnectDuration"] = duration;
      sendDataToBackend();
    }
  }
}

function updateStatus(connected) {
  wsConnectStatus.className = connected ? "status connected" : "status disconnected";
  wsConnectStatus.textContent = connected ? "Connected" : "Disconnected";
  wsConnectBtn.disabled = connected;
}

async function connect() {
  connectionStartTime = Date.now();
  updateStatus(false);

  ws = new WebSocket("wss://diagnosis.dev.deledao.com");

  // 使用 Promise 等待 onopen
  await new Promise((resolve, reject) => {
    ws.onopen = function () {
      
      connectionEstablishedTime = Date.now();
      const connectionTime = connectionEstablishedTime - connectionStartTime;
      wsConnectTime.textContent = `${connectionTime} ms`;

      const log = {
        status: "success",
        "wsConnectTime": connectionTime,
      }
      collectedData["wsStatus"] = log;
      
      updateStatus(true);

      // 啟動計時器
      connectionTimer = setInterval(updateConnectionDuration, 1000);

      console.log("Connected to WebSocket server");
      resolve();
    };

    ws.onerror = function (error) {
      collectedData.wsStatus = "error";
      updateStatus(false);
      reject(error);
    };
  });

  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "ping") {
      // Respond to heartbeat
      ws.send(JSON.stringify({ type: "pong" }));
      lastHeartbeat = new Date().toLocaleTimeString();
      wsConnectLastHeartbeat.textContent = lastHeartbeat;
    }

    console.log("Received:", data);
  };

  ws.onclose = function () {
    console.log("Disconnected from WebSocket server");
    updateStatus(false);
    clearInterval(connectionTimer);

    if (connectionEstablishedTime) {
      const totalDuration = Math.floor(
        (Date.now() - connectionEstablishedTime) / 1000
      );
      wsConnectDuration.textContent = `${totalDuration} seconds (Disconnected)`;
    }

    ws = null;
    connectionEstablishedTime = null;
  };

  ws.onerror = function (error) {
    console.error("WebSocket error:", error);
    updateStatus(false);
  };
}

wsDisconnectBtn.addEventListener("click", function () {
  console.log("Disconnecting WebSocket...");
  if (ws) {
    ws.close();
  }
});

wsConnectBtn.addEventListener("click", connect);
