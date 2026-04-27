const DemandCounter = require("../models/DemandCounter");

const incrementDemand = async (geohash) => {
  await DemandCounter.updateOne(
    { geohash },
    { $inc: { count: 1 } },
    { upsert: true }
  );
};

const getDemandMap = async () => {
  const counters = await DemandCounter.find({}).lean();

  return counters.reduce((map, counter) => {
    map[counter.geohash] = counter.count;
    return map;
  }, {});
};

module.exports = {
  incrementDemand,
  getDemandMap,
};
