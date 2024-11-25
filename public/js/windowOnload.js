window.onload = async function () {
  try {
    // 使用 try...catch 單獨處理每個步驟的錯誤
    try {
      await connect();
    } catch (error) {
      const log = {
        "webSocket error during connect": JSON.stringify(error),
      }
      collectedData.wsStatus = log;
      console.error("WebSocket error during connect:", error);
    }

    const url2 = window.location;
    const params2 = new URLSearchParams(url2.search);
    const test = params2.get('test');
    const testEle = document.querySelector("#test");
    if(test){
      testEle.removeAttribute("style");
      try {
        await connect2();
      } catch (error) {
        const log = {
          "webSocket error during connect": JSON.stringify(error),
        }
        collectedData["wsStatus2"] = log;
        console.error("WebSocket error during connect:", error);
      }
    }
    

    try {
      await startHealthCheckDiagnosis();
    } catch (error) {
        console.error("Error during startHealthCheckDiagnosis:", error);
    }
    
    try {
      await checkIp();
    } catch (error) {
      console.error("Error during checkIp:", error);
    }

    // 最後仍然執行 sendDataToBackend
    sendDataToBackend();
  } catch (error) {
    // 如果外層有錯誤，處理這些錯誤
    console.error("Error during execution:", error);
    sendDataToBackend();
  }
};
