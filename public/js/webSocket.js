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
      collectedData["wsStatus"]["wsConnectDuration"] = duration;
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

  ws = new WebSocket("/");

  // 使用 Promise 等待 onopen
  await new Promise((resolve, reject) => {
    ws.onopen = function () {

      connectionEstablishedTime = Date.now();
      const connectionTime = connectionEstablishedTime - connectionStartTime;
      wsConnectTime.textContent = `${connectionTime} ms`;

      updateStatus(true);
      
      // 啟動計時器
      connectionTimer = setInterval(updateConnectionDuration, 1000);

      const log = {
        status: "success",
        "wsConnectTime": connectionTime,
        wsConnectDuration: 0,
      }
      collectedData["wsStatus"] = log;
      
      console.log("Connected to WebSocket server");
      resolve();
    };

    ws.onerror = function (error) {
      updateStatus(false);

      collectedData["wsStatus"]["wsConnectDuration"] = Number(wsConnectDuration?.textContent?.replace(" seconds (Disconnected)", "")) || Number(wsConnectDuration?.textContent?.replace("-", "")) || 0;
      collectedData["wsStatus"]["status"] = "onerror";
      sendDataToBackend();

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

    // 當被關閉連線，頁面上顯示最後的時間
    if (connectionEstablishedTime) {
      const totalDuration = Math.floor(
        (Date.now() - connectionEstablishedTime) / 1000
      );
      wsConnectDuration.textContent = `${totalDuration} seconds (Disconnected)`;
    }

    collectedData["wsStatus"]["wsConnectDuration"] = Number(wsConnectDuration?.textContent?.replace(" seconds (Disconnected)", ""));
    collectedData["wsStatus"]["status"] = "onclose";
    sendDataToBackend();

    ws = null;
    connectionEstablishedTime = null;
  };
}

wsDisconnectBtn.addEventListener("click", function () {
  console.log("Disconnecting WebSocket...");
  if (ws) {
    ws.close();
  }
});

wsConnectBtn.addEventListener("click", connect);
