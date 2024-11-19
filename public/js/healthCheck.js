async function startHealthCheckDiagnosis(count = 1) {
  const healthCheckResultDiv = document.getElementById("healthCheckStatus");
  const healthCheckConnectTime = document.querySelector(
    "#healthCheckConnectTime"
  );
  const totalTime = document.querySelector("#totalTime");
  const retryCount = document.querySelector("#retryCount");
  const httpStatus = document.querySelector("#httpStatus");

  if (count === 1) {
    healthCheckConnectTime.innerHTML = new Date().toLocaleString();
  }

  // 設定重試次數上限，這裡假設最大重試次數為 3
  const maxRetries = 3;

  // 設定每次請求的超時時間為 5 的次方
  const timeout = 5 ** (count - 1); // 根據 count 計算 timeout

  // 建立 log 記錄
  const logEntry = {
    attempt: count,
    timeoutMs: timeout * 1000,
  };

  // 使用 axios 進行 API 請求
  const startTime = Date.now();
  axios
    .get("https://signal.deledao.com/HealthCheck", { timeout: timeout * 1000 })
    .then((response) => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      logEntry.status = "success";
      logEntry.statusCode = response.status;
      logEntry.statusText = response.statusText;
      logEntry.elapsedTimeMs = elapsedTime;

      healthCheckResultDiv.innerHTML = `Health check successful!`;
      healthCheckResultDiv.className = "status connected";

      healthCheckBtn.disabled = true;

      retryCount.innerHTML = count;
      totalTime.innerHTML = elapsedTime + "ms";
      httpStatus.innerHTML = response.status;

      collectedData.healthCheckStatus = {
        ...logEntry,
      };
      console.log(collectedData);
      sendDataToBackend();
    })
    .catch((error) => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.error("Request failed:", error.message);

      logEntry.status = "fail";
      logEntry.error = error.message;
      logEntry.elapsedTimeMs = elapsedTime;

      healthCheckResultDiv.innerHTML =
        "Unable to connect to the health check service!";
      healthCheckResultDiv.className = "status disconnected";

      retryCount.innerHTML = count;

      collectedData.healthCheckStatus = {
        ...logEntry,
      };

      console.log(collectedData);
      sendDataToBackend();

      // 如果超過最大重試次數，則不再重試
      if (count < maxRetries) {
        console.log(
          `Retry attempt ${count}, timeout exceeded: ${timeout * 1000} ms`
        );
        setTimeout(() => {
          // 延遲 1 秒後重試
          startHealthCheckDiagnosis(count + 1);
        }, 1000); // 每次重試間隔 1 秒
      } else {
        console.log("Retry limit reached, request terminated.");
      }
    });
}

const healthCheckBtn = document.getElementById("healthCheckBtn");
healthCheckBtn.addEventListener("click", () => {
  startHealthCheckDiagnosis(1);
});
