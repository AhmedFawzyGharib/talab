const mongoose = require("mongoose");

const driverApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicleType: String,
    licenseImage: String,
    idCardImage: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DriverApplication",
  driverApplicationSchema
);