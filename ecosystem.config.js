module.exports = {
    apps: [
      {
        name: "webApp",
        script: "npm",
        args: "start",
      },
      {
        name: "webSocket",
        script: "node",
        args: "webSocket/server.js",
      },
    ],
  };