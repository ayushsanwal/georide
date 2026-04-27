const express = require("express");
const cors = require("cors");

const riderController = require("./controllers/riderController");
const rideController = require("./controllers/rideController");
const adminController = require("./controllers/adminController");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GeoRide Backend Running");
});

app.get("/rider/nearby-drivers", riderController.getNearbyDrivers);

app.post("/ride/request", rideController.createRide);
app.get("/ride/current", rideController.getRide);
app.get("/ride/driver", rideController.getRideForDriver);
app.post("/ride/verify-otp", rideController.verifyRideOTP);
app.post("/ride/end", rideController.endRideController);
app.post("/ride/cancel", rideController.cancelRideController);

app.get("/admin/demand", adminController.getDemand);
app.get("/admin/hotspots", adminController.getHotspotsController);
app.get("/admin/recommendations", adminController.getRecommendationsController);

module.exports = app;
