if (navigator.connection) {
    const connection = navigator.connection;

    console.log('Connection type:', connection.effectiveType);
    console.log('Downlink:', connection.downlink, 'Mbps');
    console.log('RTT:', connection.rtt, 'ms');
    console.log('Save Data:', connection.saveData);

    navigator.connection.onchange = () => {
        console.log("Network connection has changed!");
        console.log("New network type:", navigator.connection.effectiveType);
        console.log("New download speed:", navigator.connection.downlink, "Mbps");

        collectedData.navigatorConn["onchange"] = "Network connection has changed";

        collectedData.navigatorConn["downlinkMbps"] = connection.downlink;
        collectedData.navigatorConn["effectiveType"] = connection.effectiveType;
        collectedData.navigatorConn["rttMs"] = connection.rtt;
        collectedData.navigatorConn["saveData"] = connection.saveData;
        sendDataToBackend();
    };

    collectedData.navigatorConn["downlinkMbps"] = connection.downlink;
    collectedData.navigatorConn["effectiveType"] = connection.effectiveType;
    collectedData.navigatorConn["rttMs"] = connection.rtt;
    collectedData.navigatorConn["saveData"] = connection.saveData;
} else {
    collectedData.navigatorConn["error"] = "Network Information API is not supported in this browser";
    console.log('Network Information API is not supported in this browser.');
}