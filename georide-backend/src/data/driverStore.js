const driversByGeohash = {};
const driversById = {};

const addOrUpdateDriver = (driver) => {
  const { id, geohash } = driver;

  // remove from old geohash if exists
  if (driversById[id]) {
    const oldGeohash = driversById[id].geohash;
    driversByGeohash[oldGeohash] = driversByGeohash[
      oldGeohash
    ]?.filter((d) => d.id !== id);
  }

  // add to new geohash
  if (!driversByGeohash[geohash]) {
    driversByGeohash[geohash] = [];
  }

  driversByGeohash[geohash].push(driver);

  // store by id
  driversById[id] = driver;

  console.log("📦 DRIVER STORE:", Object.keys(driversById).length);
};

const findDriverById = (id) => driversById[id];

const getAllDrivers = () => Object.values(driversById);

const getDriversByGeohash = (geohash) => {
  return driversByGeohash[geohash] || [];
};

module.exports = {
  addOrUpdateDriver,
  findDriverById,
  getAllDrivers,
  driversByGeohash,
  getDriversByGeohash,
};