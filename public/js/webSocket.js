// let ws = null;
// let ws2 = null;
// let connectionStartTime = null;
// let connectionStartTime2 = null;
// let connectionEstablishedTime = null;
// let connectionEstablishedTime2 = null;
// let connectionTimer = null;
// let connectionTimer2 = null;
// let lastHeartbeat = null;
// let lastHeartbeat2 = null;

// const wsConnectBtn = document.getElementById("wsConnectBtn");
// const ws2ConnectBtn = document.getElementById("ws2ConnectBtn");
// const wsDisconnectBtn = document.getElementById("wsDisconnectBtn");
// const ws2DisconnectBtn = document.getElementById("ws2DisconnectBtn");
// const wsConnectStatus = document.getElementById("wsConnectStatus");
// const ws2ConnectStatus = document.getElementById("ws2ConnectStatus");
// const wsConnectTime = document.getElementById("wsConnectTime");
// const ws2ConnectTime = document.getElementById("ws2ConnectTime");
// const wsConnectDuration = document.getElementById("wsConnectDuration");
// const ws2ConnectDuration = document.getElementById("ws2ConnectDuration");
// const wsConnectLastHeartbeat = document.getElementById("wsConnectLastHeartbeat");
// const ws2ConnectLastHeartbeat = document.getElementById("ws2ConnectLastHeartbeat");

// wsConnectLastHeartbeat.innerHTML = "-";
// ws2ConnectLastHeartbeat.innerHTML = "-";

// function updateConnectionDuration() {
//   if (connectionEstablishedTime) {
//     const duration = Math.floor(
//       (Date.now() - connectionEstablishedTime) / 1000
//     );
//     wsConnectDuration.textContent = `${duration} seconds`;

//     if (duration % 60 === 0 && duration <= 600) {
//       collectedData["wsConnectDuration"] = duration;
//       sendDataToBackend();
//     }
//   }
// }

// function updateStatus(connected, wsConnectStatusElem, wsConnectBtnElem) {
//   wsConnectStatusElem.className = connected ? "status connected" : "status disconnected";
//   wsConnectStatusElem.textContent = connected ? "Connected" : "Disconnected";
//   wsConnectBtnElem.disabled = connected;
// }

// async function connect(ws, wsConnectStatusElem, wsConnectBtnElem, wsConnectTimeElem, wsConnectDurationElem, wsConnectLastHeartbeatElem, connectionStartTimeElem, connectionEstablishedTimeElem) {
//   connectionStartTimeElem = Date.now();
//   updateStatus(false, wsConnectStatusElem, wsConnectBtnElem);

//   ws = new WebSocket("/");

//   // 使用 Promise 等待 onopen
//   await new Promise((resolve, reject) => {
//     ws.onopen = function () {

//       connectionEstablishedTimeElem = Date.now();
//       const connectionTime = connectionEstablishedTimeElem - connectionStartTimeElem;
//       wsConnectTimeElem.textContent = `${connectionTime} ms`;

//       const log = {
//         status: "success",
//         "wsConnectTime": connectionTime,
//       }
//       collectedData["wsStatus"] = log;
      
//       updateStatus(true);

//       // 啟動計時器
//       connectionTimer = setInterval(updateConnectionDuration, 1000);

//       console.log("Connected to WebSocket server");
//       resolve();
//     };

//     ws.onerror = function (error) {
//       collectedData.wsStatus = "error";
//       updateStatus(false);
//       reject(error);
//     };
//   });

//   ws.onmessage = function (event) {
//     const data = JSON.parse(event.data);

//     if (data.type === "ping") {
//       // Respond to heartbeat
//       ws.send(JSON.stringify({ type: "pong" }));
//       lastHeartbeat = new Date().toLocaleTimeString();
//       wsConnectLastHeartbeat.textContent = lastHeartbeat;
//     }

//     console.log("Received:", data);
//   };

//   ws.onclose = function () {
//     console.log("Disconnected from WebSocket server");
//     updateStatus(false);
//     clearInterval(connectionTimer);

//     if (connectionEstablishedTime) {
//       const totalDuration = Math.floor(
//         (Date.now() - connectionEstablishedTime) / 1000
//       );
//       wsConnectDuration.textContent = `${totalDuration} seconds (Disconnected)`;
//     }

//     ws = null;
//     connectionEstablishedTime = null;
//   };

//   ws.onerror = function (error) {
//     console.error("WebSocket error:", error);
//     updateStatus(false);
//   };
// }

// wsDisconnectBtn.addEventListener("click", function () {
//   console.log("Disconnecting WebSocket...");
//   if (ws) {
//     ws.close();
//   }
// });

// wsConnectBtn.addEventListener("click", connect);

// function reconnectEveryFiveMinutes() {
//   setInterval(() => {
//     if (!ws || ws.readyState === WebSocket.CLOSED) {
//       console.log("Reconnecting WebSocket...");
//       connect();
//     }
//   }, 5 * 60 * 1000);
// }

// reconnectEveryFiveMinutes();

















class WebSocketManager {
  constructor(wsElementIdPrefix,url, reconnectInterval = null) {  // 預設重連間隔為 5 分鐘 (300000 ms)
    this.ws = null;
    this.prefix = wsElementIdPrefix;
    this.url = url;
    this.connectionStartTime = null;
    this.connectionEstablishedTime = null;
    this.connectionTimer = null;
    this.lastHeartbeat = null;
    this.reconnectInterval = reconnectInterval; // 設定重連間隔
    this.reconnectTimer = null;  // 用於重連的定時器
    this.cycleCount = -1;
    
    this.wsConnectBtn = document.getElementById(`${wsElementIdPrefix}ConnectBtn`);
    this.wsDisconnectBtn = document.getElementById(`${wsElementIdPrefix}DisconnectBtn`);
    this.wsConnectStatus = document.getElementById(`${wsElementIdPrefix}ConnectStatus`);
    this.wsConnectTime = document.getElementById(`${wsElementIdPrefix}ConnectTime`);
    this.wsConnectDuration = document.getElementById(`${wsElementIdPrefix}ConnectDuration`);
    this.wsConnectLastHeartbeat = document.getElementById(`${wsElementIdPrefix}ConnectLastHeartbeat`);
    this.wscycleCount = document.getElementById(`${wsElementIdPrefix}cycleCount`);

    this.ws2Runtime = document.getElementById("ws2Runtime");
    
    this.wsConnectLastHeartbeat.innerHTML = "-";
    
    this.wsConnectBtn.addEventListener("click", () => this.initialize());
    this.wsDisconnectBtn.addEventListener("click", () => this.disconnect());

    // 立即執行首次連線
    this.initialize();
  }

  async initialize() {
    if (this.reconnectInterval) {
      this.startReconnectTimer(); // 啟動重連定時器
      // ws2Runtime
    } else {
      await this.connect();
    }
  }
  
  updateConnectionDuration() {
    if (this.connectionEstablishedTime) {
      const duration = Math.floor((Date.now() - this.connectionEstablishedTime) / 1000);
      this.wsConnectDuration.textContent = `${duration} seconds`;

      if (duration % 60 === 0 && duration <= 600 && this.prefix === "ws") {
        collectedData[`${this.prefix}ConnectDuration`] = duration;
        sendDataToBackend();
      }
    }
  }
  
  updateStatus(connected) {
    if (this.prefix === "ws") {
      this.wsConnectStatus.className = connected ? "status connected" : "status disconnected";
      this.wsConnectStatus.textContent = connected ? "Connected" : "Disconnected";
      this.wsConnectBtn.disabled = connected;
    } else {
      this.wsConnectStatus.className = connected ? "status connected" : "status disconnected";
      this.wsConnectStatus.textContent = connected ? "Connected" : "Disconnected";
      this.wsConnectBtn.disabled = connected;
    }
  }

  async connect() {
    // try {

      if (this.ws) {
        console.log("Already connected.");
        return;
      }
      
      this.connectionStartTime = Date.now();
      this.updateStatus(false);
      
      this.ws = new WebSocket(this.url);

      // 使用 Promise 等待 onopen
      await new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          this.connectionEstablishedTime = Date.now();
          const connectionTime = this.connectionEstablishedTime - this.connectionStartTime;
          this.wsConnectTime.textContent = `${connectionTime} ms`;

          const log = {
            status: "success",
            "wsConnectTime": connectionTime,
          }
          collectedData[`${this.prefix}Status`] = log;

          if(this.prefix === "ws2") {
            collectedData[`${this.prefix}Status`].cycleCount = this.cycleCount;
            sendDataToBackend();
          }

          this.updateStatus(true);

          // 啟動計時器
          this.connectionTimer = setInterval(() => {
            this.updateConnectionDuration();
          }, 1000);

          console.log("Connected to WebSocket server");
          resolve();
        };

        this.ws.onerror = (error) => {
          this.updateStatus(false);
          console.log("errorerrorerrorerrorerrorerror", error)
          reject(error);
          if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
          } 
        };
      });

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "ping") {
          // Respond to heartbeat
          this.ws.send(JSON.stringify({ type: "pong" }));
          this.lastHeartbeat = new Date().toLocaleTimeString();
          this.wsConnectLastHeartbeat.textContent = this.lastHeartbeat;
        }

        console.log("Received:", data);
      };

      this.ws.onclose = () => {
        console.log("Disconnected from WebSocket server");
        this.updateStatus(false);
        clearInterval(this.connectionTimer);

        if (this.connectionEstablishedTime) {
          const totalDuration = Math.floor((Date.now() - this.connectionEstablishedTime) / 1000);
          this.wsConnectDuration.textContent = `${totalDuration} seconds (Disconnected)`;
        }

        this.ws = null;
        this.connectionEstablishedTime = null;

        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.startReconnectTimer();
        } 
      };

    // }catch(err){
    //   console.log("errerrerrerrerrerrerr",err)
    //   throw err
    // }
  }

  disconnect() {
    if (this.ws) {
      console.log("Disconnecting WebSocket...");
      this.ws.close();
    }
  }

  startReconnectTimer() {

    if(this.cycleCount < 0) {
      this.cycleCount++;
      this.connect();
      console.log(`${this.prefix} connecting WebSocket...`);
      this.wscycleCount.textContent = this.cycleCount;

      this.reconnectTimer = setInterval(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      this.reconnectTimer = setInterval(() => {
        console.log("Disconnecting and reconnecting WebSocket...");
        this.cycleCount++;
        this.connect();     // 立即重新建立連線
        this.wscycleCount.textContent = this.cycleCount;
      }, this.reconnectInterval);
    }
    
  }
}