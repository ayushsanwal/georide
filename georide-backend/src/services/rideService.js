const { findNearbyDrivers } = require("./matchingService");

let currentRide = null; // ✅ MUST BE NULL

const requestRide = (pickupLat, pickupLng, dropLat, dropLng) => {
  const drivers = findNearbyDrivers(pickupLat, pickupLng, 5);

  if (!drivers || drivers.length === 0) return null;

  const driver = drivers[0];
  driver.status = "BUSY";

  const tripDistance = Math.sqrt(
    (pickupLat - dropLat) ** 2 + (pickupLng - dropLng) ** 2
  ) * 111;

  const fare = Math.round(50 + tripDistance * 20);
  const eta = Math.round(tripDistance * 4);
  const otp = Math.floor(1000 + Math.random() * 9000);

  currentRide = {
    driver,
    pickup: { lat: pickupLat, lng: pickupLng },
    drop: { lat: dropLat, lng: dropLng },
    tripDistance,
    fare,
    eta,
    otp,
    status: "ASSIGNED",
  };

  return currentRide;
};

const getCurrentRide = () => {
  return currentRide; // can be null
};

const verifyOTP = (otp) => {
  if (currentRide && currentRide.otp == otp) {
    currentRide.status = "ONGOING";
    return true;
  }
  return false;
};

const endRide = () => {
  if (currentRide) {
    currentRide.driver.status = "AVAILABLE";
  }
  currentRide = null; // ✅ CRITICAL FIX
};

module.exports = {
  requestRide,
  getCurrentRide,
  verifyOTP,
  endRide,
};