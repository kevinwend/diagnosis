let ws2 = null;
let connectionStartTime2 = null;
let connectionEstablishedTime2 = null;
let connectionTimer2 = null;
let lastHeartbeat2 = null;
let cycleCount = 0;

let ws2Runtime = null;
let ws2RuntimeDuration = 0;
let ws2RuntimeSetInterval = null;
let connect2SetInterval = null;

const ws2ConnectBtn = document.getElementById("ws2ConnectBtn");
const ws2DisconnectBtn = document.getElementById("ws2DisconnectBtn");
const ws2ConnectStatus = document.getElementById("ws2ConnectStatus");
const ws2ConnectTime = document.getElementById("ws2ConnectTime");
const ws2ConnectDuration = document.getElementById("ws2ConnectDuration");
const ws2ConnectLastHeartbeat = document.getElementById("ws2ConnectLastHeartbeat");
const ws2cycleCount = document.getElementById("ws2CycleCount");
const ws2RuntimeEle = document.getElementById("ws2Runtime");

ws2ConnectLastHeartbeat.innerHTML = "-";

function updateConnectionDuration2() {
  if (connectionEstablishedTime2) {
    const duration = Math.floor(
      (Date.now() - connectionEstablishedTime2) / 1000
    );
    ws2ConnectDuration.textContent = `${duration} seconds`;

    if (duration % 60 === 0 && duration <= 600) {
      collectedData["wsStatus2"]["wsConnectDuration2"] = duration;
      sendDataToBackend();
    }
  }
}

function updateStatus2(connected) {
  ws2ConnectStatus.className = connected ? "status connected" : "status disconnected";
  ws2ConnectStatus.textContent = connected ? "Running" : "Error";
  ws2ConnectBtn.disabled = connected;
}

async function connect2() {
  connectionStartTime2 = Date.now();
  
  ws2 = new WebSocket("wss://signal.dev.deledao.com/test");
  
  // 使用 Promise 等待 onopen
  await new Promise((resolve, reject) => {
    ws2.onopen = function () {
      updateStatus2(true);

      connectionEstablishedTime2 = Date.now();
      const connectionTime = connectionEstablishedTime2 - connectionStartTime2;
      ws2ConnectTime.textContent = `${connectionTime} ms`;

      const log = {
        status: "success",
        "wsConnectTime": connectionTime,
        cycleCount: cycleCount,
        runtimeSec: ws2RuntimeDuration,
      }
      collectedData["wsStatus2"] = log;
      if(ws2Runtime) {
        sendDataToBackend();
      }
      
      // 啟動計時器
      connectionTimer2 = setInterval(updateConnectionDuration2, 1000);
      if(!ws2Runtime) {
        ws2StartRuntime();
      }

      console.log("Connected to WebSocket server2");
      resolve();
    };

    ws2.onerror = function (error) {
      clearInterval(ws2RuntimeSetInterval);
      clearInterval(connectionTimer2);
      clearInterval(connect2SetInterval);
      updateStatus2(false);
      console.error("WebSocket error:", error);


      collectedData["wsStatus2"]["wsConnectTime"] = Number(ws2ConnectTime.textContent.replace(" ms", ""));
      collectedData["wsStatus2"]["runtimeSec"] = ws2RuntimeDuration;
      collectedData["wsStatus2"]["cycleCount"] = cycleCount;
      collectedData["wsStatus2"]["status"] = "error";
      sendDataToBackend();

      reject(error)
    };
  });

  ws2.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "ping") {
      // Respond to heartbeat
      ws2.send(JSON.stringify({ type: "pong" }));
      lastHeartbeat = new Date().toLocaleTimeString();
      ws2ConnectLastHeartbeat.textContent = lastHeartbeat;
    }

    console.log("Received:", data);
  };

  ws2.onclose = function () {
    console.log("Disconnected from WebSocket server");
    clearInterval(connectionTimer2);

    if (connectionEstablishedTime2) {
      const totalDuration = Math.floor(
        (Date.now() - connectionEstablishedTime2) / 1000
      );
      ws2ConnectDuration.textContent = `${totalDuration} seconds (Disconnected)`;
    }

    ws2 = null;
    connectionEstablishedTime2 = null;
  };
}

ws2DisconnectBtn.addEventListener("click", function () {
  console.log("Disconnecting WebSocket...");
  if (ws) {
    ws2.close();
  }
});


ws2ConnectBtn.addEventListener("click", connect);



function ws2StartRuntime() {
  ws2cycleCount.textContent = cycleCount;
  ws2Runtime = Date.now();
  
  
  ws2RuntimeSetInterval = setInterval(()=>{
    if (ws2Runtime) {
      const duration = Math.floor(
        (Date.now() - ws2Runtime) / 1000
      );
      ws2RuntimeDuration = duration;
      ws2RuntimeEle.textContent = `${duration} seconds`;
    }
  }, 1000);
}

connect2SetInterval = setInterval(()=>{
  connect2();
  cycleCount++;
  ws2cycleCount.textContent = cycleCount;
}, 1000 * 60 * 5)
