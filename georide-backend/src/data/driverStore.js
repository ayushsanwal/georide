const Driver = require("../models/Driver");

const addOrUpdateDriver = async (driver) => {
  const { id, geohash } = driver;

  if (!id || !geohash) return null;

  const updatedDriver = await Driver.findOneAndUpdate(
    { id },
    {
      $set: {
        lat: driver.lat,
        lng: driver.lng,
        geohash: driver.geohash,
        updatedAt: driver.updatedAt || Date.now(),
      },
      $setOnInsert: {
        status: driver.status || "AVAILABLE",
        currentRideId: driver.currentRideId || null,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      lean: true,
    }
  );

  return updatedDriver;
};

const findDriverById = async (id) => Driver.findOne({ id }).lean();

const getAllDrivers = async () => Driver.find({}).lean();

const getDriversByGeohash = async (geohash) =>
  Driver.find({ geohash }).lean();

const findDriversByGeohashes = async (geohashes, maxUpdatedAtAgeMs) => {
  const minUpdatedAt = Date.now() - maxUpdatedAtAgeMs;

  return Driver.find({
    geohash: { $in: geohashes },
    updatedAt: { $gte: minUpdatedAt },
  }).lean();
};

const setDriverBusy = async (id, rideId) =>
  Driver.findOneAndUpdate(
    { id, status: "AVAILABLE" },
    {
      $set: {
        status: "BUSY",
        currentRideId: rideId,
      },
    },
    { returnDocument: "after", lean: true }
  );

const setDriverAvailable = async (id) =>
  Driver.findOneAndUpdate(
    { id },
    {
      $set: {
        status: "AVAILABLE",
        currentRideId: null,
      },
    },
    { returnDocument: "after", lean: true }
  );

module.exports = {
  addOrUpdateDriver,
  findDriverById,
  getAllDrivers,
  getDriversByGeohash,
  findDriversByGeohashes,
  setDriverBusy,
  setDriverAvailable,
};
