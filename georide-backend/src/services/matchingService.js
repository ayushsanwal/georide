const geohash = require("ngeohash");
const { findDriversByGeohashes } = require("../data/driverStore");
const { getDistance } = require("../utils/distance");

const DEFAULT_RADIUS_KM = 5;
const DEFAULT_LIMIT = 5;
const DEFAULT_MAX_DRIVER_AGE_MS = 30000;

const findNearbyDrivers = async (lat, lng, options = {}) => {
  const {
    radiusKm = DEFAULT_RADIUS_KM,
    limit = DEFAULT_LIMIT,
    maxDriverAgeMs = DEFAULT_MAX_DRIVER_AGE_MS,
  } = options;

  const pickupHash = geohash.encode(lat, lng, 6);
  const searchHashes = [pickupHash, ...geohash.neighbors(pickupHash)];
  const candidates = await findDriversByGeohashes(searchHashes, maxDriverAgeMs);
  const candidatesById = new Map();

  candidates.forEach((driver) => {
    candidatesById.set(driver.id, driver);
  });

  const withDistance = [...candidatesById.values()]
    .filter((driver) => driver.status === "AVAILABLE")
    .map((driver) => ({
      ...driver,
      distance: getDistance(lat, lng, driver.lat, driver.lng),
    }))
    .filter((driver) => driver.distance <= radiusKm);

  withDistance.sort((a, b) => a.distance - b.distance);

  return withDistance.slice(0, limit);
};

module.exports = {
  findNearbyDrivers,
};
