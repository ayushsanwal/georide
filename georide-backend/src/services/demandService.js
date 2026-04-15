const { getDemandMap } = require("../data/demandStore");

const getHotspots = (limit = 3) => {
  const demand = getDemandMap();

  const entries = Object.entries(demand);

  // Sort by demand (descending)
  entries.sort((a, b) => b[1] - a[1]);

  // Return top K
  return entries.slice(0, limit).map(([geohash, count]) => ({
    geohash,
    demand: count,
  }));
};

module.exports = {
  getHotspots,
};