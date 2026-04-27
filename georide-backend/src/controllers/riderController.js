const { findNearbyDrivers } = require("../services/matchingService");

const getNearbyDrivers = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "INVALID_LOCATION" });
  }

  try {
    const drivers = await findNearbyDrivers(lat, lng);

    return res.json({
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

module.exports = {
  getNearbyDrivers,
};
