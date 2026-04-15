const { driversByGeohash } = require("../data/driverStore");
const geohash = require("ngeohash");
const { getDistance } = require("../utils/distance");

const findNearbyDrivers = (lat, lng, limit = 5) => {
  const hash = geohash.encode(lat, lng, 6);

  // current + neighbors
  const neighbors = geohash.neighbors(hash);

  const searchHashes = [hash, ...neighbors];

  let candidates = [];

  searchHashes.forEach((h) => {
    if (driversByGeohash[h]) {
      candidates.push(...driversByGeohash[h]);
    }
  });

  // filter available
  const available = candidates.filter(
    (d) => d.status === "AVAILABLE"
  );

  // compute distance
  const withDistance = available.map((d) => ({
    ...d,
    distance: getDistance(lat, lng, d.lat, d.lng),
  }));

  // sort
  withDistance.sort((a, b) => a.distance - b.distance);

  return withDistance.slice(0, limit);
};

module.exports = {
  findNearbyDrivers,
};