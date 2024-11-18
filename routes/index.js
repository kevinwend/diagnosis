var express = require("express");
var router = express.Router();
import fetch from "node-fetch";
const path = require('path');


/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


router.get("/health-check", async (req, res) => {
  // try {
  //   const response = await fetch("https://signal.deledao.com/HealthCheck");

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! Status: ${response.status}`);
  //   }

  //   const data = await response.text();

  //   res.json({data, status: "success"});
  // } catch (error) {
  //   res.status(500).json({ error: error, status: "error" });
  // }
  res.status(200).send("ok");
});


router.post("/saveConnectionData", (req, res) =>{
  const { wsStatus, healthCheckStatus, ipAddress } = req.body;
  const log = {
    connTest: {
      wsStatus: wsStatus || "error",
      healthCheck: healthCheckStatus || "error",
      userIp: ipAddress || "error",
    }
  }
  console.log(JSON.stringify(log))
  res.json("")
})

module.exports = router;
