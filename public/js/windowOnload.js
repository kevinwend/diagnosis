window.onload = async function () {
  try {
    await connect();
    await startHealthCheckDiagnosis();
    await checkIp();
    
    sendDataToBackend();
  } catch (error) {
    sendDataToBackend();
    console.error("Error during execution:", error);
  }
};
