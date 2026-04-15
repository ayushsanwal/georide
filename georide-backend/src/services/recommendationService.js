const { getHotspots } = require("./demandService");
const { getDriversByGeohash } = require("../data/driverStore");

// Suggest drivers for hotspots
const recommendDrivers = () => {
  const hotspots = getHotspots(3);

  const recommendations = [];

  for (const hotspot of hotspots) {
    const drivers = getDriversByGeohash(hotspot.geohash);

    const availableDrivers = drivers.filter(
      (d) => d.status === "AVAILABLE"
    );

    recommendations.push({
      geohash: hotspot.geohash,
      demand: hotspot.demand,
      availableDrivers: availableDrivers.map((d) => d.id),
    });
  }

  return recommendations;
};

module.exports = {
  recommendDrivers,
};