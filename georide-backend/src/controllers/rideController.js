const {
  requestRide,
  getRideByRider,
  getRideByDriver,
  verifyOTP,
  endRide,
  cancelRide,
} = require("../services/rideService");

const parseCoordinate = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const sendRideError = (res, error) => {
  const messages = {
    RIDE_EXISTS: "You already have an active ride",
    NO_DRIVERS: "No drivers available nearby",
    INVALID_OTP: "Invalid OTP",
    RIDE_NOT_ASSIGNED: "Ride is not waiting for OTP verification",
    NO_ACTIVE_RIDE: "No active ride found",
  };

  return res.status(400).json({
    error,
    message: messages[error] || "Request failed",
  });
};

const createRide = async (req, res) => {
  const { riderId } = req.body;
  const pickupLat = parseCoordinate(req.body.pickupLat);
  const pickupLng = parseCoordinate(req.body.pickupLng);
  const dropLat = parseCoordinate(req.body.dropLat);
  const dropLng = parseCoordinate(req.body.dropLng);

  if (!riderId) {
    return res.status(400).json({
      error: "MISSING_RIDER",
      message: "Missing riderId",
    });
  }

  if (
    pickupLat === null ||
    pickupLng === null ||
    dropLat === null ||
    dropLng === null
  ) {
    return res.status(400).json({
      error: "INVALID_LOCATION",
      message: "Invalid pickup or drop location",
    });
  }

  try {
    const result = await requestRide(
      riderId,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng
    );

    if (result.error) {
      return sendRideError(res, result.error);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getRide = async (req, res) => {
  const { riderId } = req.query;

  if (!riderId) {
    return res.status(400).json({
      error: "MISSING_RIDER",
      message: "Missing riderId",
    });
  }

  try {
    return res.json(await getRideByRider(riderId));
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getRideForDriver = async (req, res) => {
  const { driverId } = req.query;

  if (!driverId) {
    return res.status(400).json({
      error: "MISSING_DRIVER",
      message: "Missing driverId",
    });
  }

  try {
    return res.json(await getRideByDriver(driverId));
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const verifyRideOTP = async (req, res) => {
  const { riderId, otp } = req.body;

  if (!riderId || otp === undefined || otp === null || otp === "") {
    return res.status(400).json({
      error: "MISSING_OTP",
      message: "Missing riderId or OTP",
    });
  }

  try {
    const result = await verifyOTP(riderId, otp);

    if (result.error) {
      return sendRideError(res, result.error);
    }

    return res.json({
      message: "Ride started",
      ride: result.ride,
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const endRideController = async (req, res) => {
  const { riderId } = req.body;

  if (!riderId) {
    return res.status(400).json({
      error: "MISSING_RIDER",
      message: "Missing riderId",
    });
  }

  try {
    const result = await endRide(riderId);

    if (result.error) {
      return sendRideError(res, result.error);
    }

    return res.json({
      message: "Ride ended",
      ride: result.ride,
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const cancelRideController = async (req, res) => {
  const { riderId } = req.body;

  if (!riderId) {
    return res.status(400).json({
      error: "MISSING_RIDER",
      message: "Missing riderId",
    });
  }

  try {
    const result = await cancelRide(riderId);

    if (result.error) {
      return sendRideError(res, result.error);
    }

    return res.json({
      message: "Ride cancelled",
      ride: result.ride,
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

module.exports = {
  createRide,
  getRide,
  getRideForDriver,
  verifyRideOTP,
  endRideController,
  cancelRideController,
};
