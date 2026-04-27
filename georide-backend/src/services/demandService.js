const geohashLib = require("ngeohash");
const { getDemandMap } = require("../data/demandStore");

const decodeHotspot = (geohash) => {
  const { latitude, longitude } = geohashLib.decode(geohash);

  return {
    geohash,
    lat: latitude,
    lng: longitude,
  };
};

const getHotspots = async (limit = 3) => {
  const demand = await getDemandMap();
  const entries = Object.entries(demand);

  entries.sort((a, b) => b[1] - a[1]);

  return entries.slice(0, limit).map(([geohash, count]) => ({
    ...decodeHotspot(geohash),
    demand: count,
  }));
};

module.exports = {
  getHotspots,
};
