const demandMap = {};


const incrementDemand = (geohash) => {
  if (!demandMap[geohash]) {
    demandMap[geohash] = 0;
  }
  demandMap[geohash]++;
};

const getDemandMap = () => {
  return demandMap;
};

module.exports = {
  incrementDemand,
  getDemandMap,
};