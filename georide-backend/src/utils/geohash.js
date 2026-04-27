const ngeohash = require("ngeohash");

const GEOHASH_PRECISION = 6;

const encodeGeohash = (lat, lng) => {
  return ngeohash.encode(lat, lng, GEOHASH_PRECISION);
};

const getNeighbors = (geohash) => {
  return ngeohash.neighbors(geohash);
};

module.exports = {
  encodeGeohash,
  getNeighbors,
  GEOHASH_PRECISION,
};
