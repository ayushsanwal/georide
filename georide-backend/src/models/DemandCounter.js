const mongoose = require("mongoose");

const demandCounterSchema = new mongoose.Schema(
  {
    geohash: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0, required: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("DemandCounter", demandCounterSchema);
