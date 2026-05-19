const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vehicleType: {
    type: String,
    enum: ["bike", "car", "motorcycle"],
    required: true
  },
  vehicleNumber: {
    type: String,
    trim: true,
  },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);