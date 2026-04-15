const ngeohash = require("ngeohash");

// 🔥 FIXED precision (DO NOT make dynamic)
const encodeGeohash = (lat, lng) => {
  return ngeohash.encode(lat, lng, 6);
};

const getNeighbors = (geohash) => {
  return ngeohash.neighbors(geohash);
};

module.exports = {
  encodeGeohash,
  getNeighbors,
};