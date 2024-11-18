const healthCheckBtn = document.getElementById("healthCheckBtn");

async function startHealthCheckDiagnosis() {
  const healthCheckResultDiv = document.getElementById("healthCheckStatus");
  const startTime = new Date().getTime();
  const connectionTimeSpan = document.getElementById("healthCheckConnectTime");

  try {
    const response = await fetch(
      "https://diagnosis.dev.deledao.com/signal-health-check"
    );
    const data = await response.text();
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;

    if (data.includes("signal is alive")) {
      const result = JSON.parse(data);
      console.log("Health check success:", result.data);
      collectedData.healthCheckStatus = "success";
      healthCheckResultDiv.innerHTML = `Health check successful!`;
      healthCheckResultDiv.className = "status connected";
      connectionTimeSpan.innerHTML = `${responseTime} ms`;
      healthCheckBtn.disabled = true;
    } else {
      collectedData.healthCheckStatus = "error";
      console.error("Health check error:", data);
      healthCheckResultDiv.innerHTML =
        "Unable to connect to the health check service!";
      healthCheckResultDiv.className = "status disconnected";
      connectionTimeSpan.innerHTML = `-`;
    }
  } catch (err) {
    collectedData.healthCheckStatus = `error: ${err.message}`;
    console.error("Health check error:", err.message);
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    healthCheckResultDiv.innerHTML = `Unable to connect to the health check service!`;
    healthCheckResultDiv.className = "status disconnected";
    connectionTimeSpan.innerHTML = `-`;
  }
}

healthCheckBtn.addEventListener("click", startHealthCheckDiagnosis);
