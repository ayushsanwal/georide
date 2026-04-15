const express = require("express");
const cors = require("cors");

const riderController = require("./controllers/riderController");
const rideController = require("./controllers/rideController");
const adminController = require("./controllers/adminController");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GeoRide Backend Running 🚀");
});

// ❌ REMOVE DRIVER ROUTE (NOT NEEDED)
// app.post("/driver/location", driverController.updateDriverLocation);

// Rider
app.get("/rider/nearby-drivers", riderController.getNearbyDrivers);

// Ride
app.post("/ride/request", rideController.createRide);
app.get("/ride/current", rideController.getRide);
app.post("/ride/verify-otp", rideController.verifyRideOTP);
app.post("/ride/end", rideController.endRideController);

// Admin
app.get("/admin/demand", adminController.getDemand);
app.get("/admin/hotspots", adminController.getHotspotsController);
app.get("/admin/recommendations", adminController.getRecommendationsController);

module.exports = app;