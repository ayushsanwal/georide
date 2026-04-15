const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const { encodeGeohash } = require("./utils/geohash");
const {
  addOrUpdateDriver,
  findDriverById,
} = require("./data/driverStore");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("driverLocationUpdate", (data) => {
    const { driverId, lat, lng } = data;

    const geohash = encodeGeohash(lat, lng);

    // 🔥 Always get existing driver first
    const existingDriver = findDriverById(driverId);

    const driver = {
      id: driverId,
      lat,
      lng,
      geohash,
      status: existingDriver
        ? existingDriver.status // preserve ALWAYS
        : "AVAILABLE",
      updatedAt: Date.now(),
    };

    addOrUpdateDriver(driver);

    io.emit("driverLocationUpdate", driver);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});