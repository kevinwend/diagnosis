const ipBtn = document.querySelector("#ipBtn");
ipBtn.addEventListener("click", checkIp);

async function checkIp() {
  const ipStatus = document.querySelector("#ipStatus");
  const ipText = document.querySelector("#ipText");

  try {
    ipText.innerHTML = (await getUserIP()) || "";
    if (ipText.innerHTML) {
      collectedData.ipAddress = ipText.innerHTML;
      console.log("my_ip:",ipText.innerHTML);
      ipStatus.className = "status connected";
      ipStatus.innerHTML = "Checked";
      ipBtn.disabled = true;
    } else {
      collectedData.ipAddress = "error";
      ipStatus.className = "status disconnected";
      ipStatus.innerHTML = "Checked Fail";
    }
  } catch (err) {
    collectedData.ipAddress = "error";
    console.log(err);
    ipStatus.className = "status disconnected";
    ipStatus.innerHTML = "Checked Fail";
    ipText.innerHTML = "-";
  }
}

function getUserIP() {
  return new Promise((resolve, reject) => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => resolve(data.ip))
      .catch((error) => reject(error));
  });
}


