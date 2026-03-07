const mongoose = require("mongoose");

const merchantApplicationSchema = new mongoose.Schema(
  {
    businessName: String,
    phone: String,
    ownerName: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MerchantApplication",
  merchantApplicationSchema
);