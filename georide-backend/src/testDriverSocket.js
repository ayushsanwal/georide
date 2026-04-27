const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

const drivers = {
  d1: { lat: 28.6139, lng: 77.2090 },
  d2: { lat: 28.6145, lng: 77.2095 },
  d3: { lat: 28.6150, lng: 77.2100 },
  d4: { lat: 28.6160, lng: 77.2110 },
  d5: { lat: 28.6170, lng: 77.2120 },
};

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  setInterval(() => {
    Object.keys(drivers).forEach((id) => {
      drivers[id].lat += (Math.random() - 0.5) * 0.0005;
      drivers[id].lng += (Math.random() - 0.5) * 0.0005;

      const data = {
        driverId: id,
        lat: drivers[id].lat,
        lng: drivers[id].lng,
      };

      console.log("Sending:", data);

      socket.emit("driverLocationUpdate", data);
    });
  }, 1000);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
