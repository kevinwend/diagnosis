function sendDataToBackend() {
  fetch("https://diagnosis.deledao.com/saveConnectionData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collectedData),
  })
    .then((response) => response.json())
    .then(() => {
      console.log("Data sent successfully!");
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}
