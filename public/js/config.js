const url = window.location;
const params = new URLSearchParams(url.search);
const email = params.get('email');

const collectedData = {
  wsStatus: {},
  wsStatus2: {},
  healthCheckStatus: {},
  ipAddress: "",
  email: email,
  role: "student",
  navigatorConn: {},
};

