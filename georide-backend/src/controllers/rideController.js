const {
  requestRide,
  getCurrentRide,
  verifyOTP,
  endRide,
} = require("../services/rideService");

const createRide = (req, res) => {
  const { pickupLat, pickupLng, dropLat, dropLng } = req.body;

  const result = requestRide(
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  );

  if (!result) {
    return res.status(404).json({
      message: "No drivers available",
    });
  }

  res.json(result);
};

const getRide = (req, res) => {
  const ride = getCurrentRide();

  if (!ride) {
    return res.json(null); // ✅ IMPORTANT
  }

  res.json(ride);
};

const verifyRideOTP = (req, res) => {
  const { otp } = req.body;

  const valid = verifyOTP(otp);

  if (!valid) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  res.json({
    message: "Ride started",
  });
};

const endRideController = (req, res) => {
  endRide();

  res.json({
    message: "Ride ended",
  });
};

module.exports = {
  createRide,
  getRide,
  verifyRideOTP,
  endRideController,
};