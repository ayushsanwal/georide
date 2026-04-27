const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    rideId: { type: String, required: true, unique: true, index: true },
    riderId: { type: String, required: true, index: true },
    driverId: { type: String, required: true, index: true },
    pickup: { type: pointSchema, required: true },
    drop: { type: pointSchema, required: true },
    distanceKm: { type: Number, required: true },
    tripDistance: { type: Number, required: true },
    fare: { type: Number, required: true },
    driverEtaMinutes: { type: Number, required: true },
    destinationEtaMinutes: { type: Number, required: true },
    eta: { type: Number, required: true },
    otp: { type: String, required: true },
    status: {
      type: String,
      enum: ["ASSIGNED", "ONGOING", "ENDED", "CANCELLED"],
      required: true,
      index: true,
    },
    createdAt: { type: Number, required: true, index: true },
    startedAt: { type: Number, default: null },
    endedAt: { type: Number, default: null },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Ride", rideSchema);
