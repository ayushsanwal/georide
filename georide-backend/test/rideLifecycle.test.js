const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Driver = require("../src/models/Driver");
const Ride = require("../src/models/Ride");
const DemandCounter = require("../src/models/DemandCounter");
const { encodeGeohash } = require("../src/utils/geohash");
const {
  addOrUpdateDriver,
  findDriverById,
} = require("../src/data/driverStore");
const {
  requestRide,
  getRideByRider,
  getRideByDriver,
  verifyOTP,
  endRide,
  cancelRide,
} = require("../src/services/rideService");
const { findNearbyDrivers } = require("../src/services/matchingService");
const { getHotspots } = require("../src/services/demandService");
const { recommendDrivers } = require("../src/services/recommendationService");

const clearDatabase = async () => {
  await Promise.all([
    Driver.deleteMany({}),
    Ride.deleteMany({}),
    DemandCounter.deleteMany({}),
  ]);
};

const addDriver = async (id, lat, lng, updatedAt = Date.now()) => {
  return addOrUpdateDriver({
    id,
    lat,
    lng,
    geohash: encodeGeohash(lat, lng),
    updatedAt,
  });
};

test.before(async () => {
  await connectDB();
});

test.beforeEach(async () => {
  await clearDatabase();
});

test.after(async () => {
  await clearDatabase();
  await mongoose.disconnect();
});

test("ride lifecycle assigns nearest driver, verifies OTP, and frees driver", async () => {
  const riderId = "r_test_lifecycle";
  const driverId = "d_test_lifecycle";

  await addDriver(driverId, 28.6139, 77.209);

  const ride = await requestRide(
    riderId,
    28.614,
    77.2091,
    28.62,
    77.22
  );

  assert.equal(ride.error, undefined);
  assert.equal(ride.riderId, riderId);
  assert.equal(ride.driverId, driverId);
  assert.equal(ride.status, "ASSIGNED");
  assert.equal((await findDriverById(driverId)).status, "BUSY");
  assert.equal((await getRideByRider(riderId)).rideId, ride.rideId);
  assert.equal((await getRideByDriver(driverId)).rideId, ride.rideId);

  const duplicate = await requestRide(
    riderId,
    28.614,
    77.2091,
    28.62,
    77.22
  );
  assert.equal(duplicate.error, "RIDE_EXISTS");

  const wrongOtp = await verifyOTP(riderId, "0000");
  assert.equal(wrongOtp.error, "INVALID_OTP");
  assert.equal((await getRideByRider(riderId)).status, "ASSIGNED");

  const started = await verifyOTP(riderId, ride.otp);
  assert.equal(started.error, undefined);
  assert.equal(started.ride.status, "ONGOING");

  const ended = await endRide(riderId);
  assert.equal(ended.error, undefined);
  assert.equal(ended.ride.status, "ENDED");
  assert.equal((await findDriverById(driverId)).status, "AVAILABLE");
  assert.equal(await getRideByRider(riderId), null);
  assert.equal(await getRideByDriver(driverId), null);
});

test("matching ignores stale drivers", async () => {
  const freshDriverId = "d_test_fresh";
  const staleDriverId = "d_test_stale";

  await addDriver(freshDriverId, 28.614, 77.209, Date.now());
  await addDriver(staleDriverId, 28.6141, 77.2091, Date.now() - 60000);

  const drivers = await findNearbyDrivers(28.614, 77.209, {
    radiusKm: 5,
    limit: 10,
    maxDriverAgeMs: 30000,
  });

  const ids = drivers.map((driver) => driver.id);
  assert.ok(ids.includes(freshDriverId));
  assert.equal(ids.includes(staleDriverId), false);
});

test("ride cancellation frees the assigned driver", async () => {
  const riderId = "r_test_cancel";
  const driverId = "d_test_cancel";

  await addDriver(driverId, 28.615, 77.21);

  const ride = await requestRide(
    riderId,
    28.615,
    77.21,
    28.621,
    77.222
  );

  assert.equal(ride.error, undefined);
  assert.equal((await findDriverById(driverId)).status, "BUSY");

  const cancelled = await cancelRide(riderId);
  assert.equal(cancelled.error, undefined);
  assert.equal(cancelled.ride.status, "CANCELLED");
  assert.equal((await findDriverById(driverId)).status, "AVAILABLE");
});

test("hotspots and recommendations include decoded location fields", async () => {
  await addDriver("d_test_hotspot", 28.6139, 77.209);
  await requestRide("r_test_hotspot", 28.614, 77.2091, 28.62, 77.22);

  const hotspots = await getHotspots(5);
  assert.ok(hotspots.length > 0);
  assert.equal(typeof hotspots[0].lat, "number");
  assert.equal(typeof hotspots[0].lng, "number");

  const recommendations = await recommendDrivers();
  assert.ok(recommendations.length > 0);
  assert.equal(typeof recommendations[0].availableDriversNearby, "number");
  assert.equal(recommendations[0].message, "High demand area");
});
