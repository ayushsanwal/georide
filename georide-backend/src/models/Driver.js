const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    geohash: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY"],
      default: "AVAILABLE",
      index: true,
    },
    currentRideId: { type: String, default: null, index: true },
    updatedAt: { type: Number, required: true, index: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Driver", driverSchema);
