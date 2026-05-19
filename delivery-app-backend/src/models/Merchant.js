const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,

    type: {
      type: String,
      enum: ["restaurant", "market", "pharmacy", "store", "clothing"],
    },

    subCategory: {
      type: String,
      trim: true,
    },

    image: String,
    description: String,

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchant", merchantSchema);