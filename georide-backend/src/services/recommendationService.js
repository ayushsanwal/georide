const { getHotspots } = require("./demandService");
const { getDriversByGeohash } = require("../data/driverStore");

const recommendDrivers = async () => {
  const hotspots = await getHotspots(3);

  return Promise.all(
    hotspots.map(async (hotspot) => {
      const drivers = await getDriversByGeohash(hotspot.geohash);
      const availableDrivers = drivers.filter(
        (driver) => driver.status === "AVAILABLE"
      );

      return {
        geohash: hotspot.geohash,
        lat: hotspot.lat,
        lng: hotspot.lng,
        demand: hotspot.demand,
        availableDrivers: availableDrivers.map((driver) => driver.id),
        availableDriversNearby: availableDrivers.length,
        message: "High demand area",
      };
    })
  );
};

module.exports = {
  recommendDrivers,
};
