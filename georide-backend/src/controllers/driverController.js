const { encodeGeohash } = require("../utils/geohash");
const { addOrUpdateDriver } = require("../data/driverStore");

const updateDriverLocation = (req, res) => {
  const { driverId, lat, lng } = req.body;

  if (!driverId || !lat || !lng) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const geohash = encodeGeohash(lat, lng);

  const driver = {
    id: driverId,
    lat,
    lng,
    geohash,
    status: "AVAILABLE", // 🔥 NEW
    updatedAt: Date.now(),
  };

  addOrUpdateDriver(driver);

  return res.json({
    message: "Driver location updated",
    driver,
  });
};

module.exports = {
  updateDriverLocation,
};