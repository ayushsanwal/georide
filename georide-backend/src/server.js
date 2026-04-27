const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
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

  socket.on("driverLocationUpdate", async (data) => {
    try {
      const { driverId } = data || {};
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);

      if (!driverId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        socket.emit("driverLocationError", {
          message: "Invalid driver location payload",
        });
        return;
      }

      const existingDriver = await findDriverById(driverId);
      const geohash = encodeGeohash(lat, lng);
      const updatedDriver = await addOrUpdateDriver({
        id: driverId,
        lat,
        lng,
        geohash,
        status: existingDriver?.status || "AVAILABLE",
        currentRideId: existingDriver?.currentRideId || null,
        updatedAt: Date.now(),
      });

      io.emit("driverLocationUpdate", updatedDriver);
    } catch (error) {
      socket.emit("driverLocationError", {
        message: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
