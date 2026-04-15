const { findNearbyDrivers } = require("../services/matchingService");

const getNearbyDrivers = (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing location" });
  }

  const drivers = findNearbyDrivers(Number(lat), Number(lng));

  return res.json({
    count: drivers.length,
    drivers,
  });
};

module.exports = {
  getNearbyDrivers,
};