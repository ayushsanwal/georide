const { findNearbyDrivers } = require("./matchingService");
const { incrementDemand } = require("../data/demandStore");
const { encodeGeohash } = require("../utils/geohash");
const {
  findDriverById,
  setDriverBusy,
  setDriverAvailable,
} = require("../data/driverStore");
const {
  calculateDistance,
  calculateFare,
  calculateETA,
} = require("../utils/fare");
const Ride = require("../models/Ride");

const ACTIVE_STATUSES = ["ASSIGNED", "ONGOING"];

const generateRideId = () => {
  return "ride_" + Math.random().toString(36).slice(2, 11);
};

const getActiveRideForRider = (riderId) =>
  Ride.findOne({
    riderId,
    status: { $in: ACTIVE_STATUSES },
  }).lean();

const getActiveRideForDriver = (driverId) =>
  Ride.findOne({
    driverId,
    status: { $in: ACTIVE_STATUSES },
  }).lean();

const requestRide = async (riderId, pickupLat, pickupLng, dropLat, dropLng) => {
  if (await getActiveRideForRider(riderId)) {
    return { error: "RIDE_EXISTS" };
  }

  const drivers = await findNearbyDrivers(pickupLat, pickupLng, {
    radiusKm: 5,
    limit: 5,
  });

  if (!drivers.length) {
    return { error: "NO_DRIVERS" };
  }

  let claimedDriver = null;
  const rideId = generateRideId();

  for (const driver of drivers) {
    claimedDriver = await setDriverBusy(driver.id, rideId);
    if (claimedDriver) break;
  }

  if (!claimedDriver) {
    return { error: "NO_DRIVERS" };
  }

  const tripDistance = calculateDistance(
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
  );
  const driverDistance = calculateDistance(
    claimedDriver.lat,
    claimedDriver.lng,
    pickupLat,
    pickupLng
  );
  const fare = calculateFare(tripDistance);
  const driverEtaMinutes = calculateETA(driverDistance);
  const destinationEtaMinutes = calculateETA(tripDistance);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const pickupHash = encodeGeohash(pickupLat, pickupLng);
  await incrementDemand(pickupHash);

  const ride = await Ride.create({
    rideId,
    riderId,
    driverId: claimedDriver.id,
    pickup: { lat: pickupLat, lng: pickupLng },
    drop: { lat: dropLat, lng: dropLng },
    distanceKm: tripDistance,
    tripDistance,
    fare,
    driverEtaMinutes,
    destinationEtaMinutes,
    eta: driverEtaMinutes,
    otp,
    status: "ASSIGNED",
    createdAt: Date.now(),
    startedAt: null,
    endedAt: null,
  });

  return ride.toObject();
};

const getRideByRider = async (riderId) => getActiveRideForRider(riderId);

const getRideByDriver = async (driverId) => {
  const activeRide = await getActiveRideForDriver(driverId);
  if (activeRide) return activeRide;

  const driver = await findDriverById(driverId);

  if (!driver?.currentRideId) {
    return null;
  }

  return Ride.findOne({
    rideId: driver.currentRideId,
    status: { $in: ACTIVE_STATUSES },
  }).lean();
};

const verifyOTP = async (riderId, otp) => {
  const ride = await getActiveRideForRider(riderId);

  if (!ride || ride.status !== "ASSIGNED") {
    return { error: "RIDE_NOT_ASSIGNED" };
  }

  if (String(ride.otp) !== String(otp)) {
    return { error: "INVALID_OTP" };
  }

  const updatedRide = await Ride.findOneAndUpdate(
    { rideId: ride.rideId, status: "ASSIGNED" },
    {
      $set: {
        status: "ONGOING",
        startedAt: Date.now(),
        eta: ride.destinationEtaMinutes,
      },
    },
    { returnDocument: "after", lean: true }
  );

  return { ride: updatedRide };
};

const finishRide = async (riderId, status) => {
  const ride = await getActiveRideForRider(riderId);

  if (!ride) {
    return { error: "NO_ACTIVE_RIDE" };
  }

  const updatedRide = await Ride.findOneAndUpdate(
    { rideId: ride.rideId, status: { $in: ACTIVE_STATUSES } },
    {
      $set: {
        status,
        endedAt: Date.now(),
      },
    },
    { returnDocument: "after", lean: true }
  );

  if (!updatedRide) {
    return { error: "NO_ACTIVE_RIDE" };
  }

  await setDriverAvailable(updatedRide.driverId);

  return { ride: updatedRide };
};

const endRide = async (riderId) => finishRide(riderId, "ENDED");

const cancelRide = async (riderId) => finishRide(riderId, "CANCELLED");

module.exports = {
  requestRide,
  getRideByRider,
  getRideByDriver,
  verifyOTP,
  endRide,
  cancelRide,
};
