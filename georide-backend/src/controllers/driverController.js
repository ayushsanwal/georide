const { encodeGeohash } = require("../utils/geohash");
const { addOrUpdateDriver } = require("../data/driverStore");

const updateDriverLocation = async (req, res) => {
  const { driverId } = req.body;
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);

  if (!driverId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "INVALID_LOCATION" });
  }

  try {
    const geohash = encodeGeohash(lat, lng);
    const driver = await addOrUpdateDriver({
      id: driverId,
      lat,
      lng,
      geohash,
      updatedAt: Date.now(),
    });

    return res.json({
      message: "Driver location updated",
      driver,
    });
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

module.exports = {
  updateDriverLocation,
};
