const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({

  type: {
    type: String,
    enum: ["merchant", "custom"],
    default: "merchant"
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    default: null
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  pickups: [
    {
      name: String,
      note: String,

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: [Number]
      }
    }
  ],

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      quantity: Number,
      total: Number
    }
  ],

  subtotal: Number,

  deliveryFee: Number,

  totalPrice: Number,

  distance: Number,

  deliveryLocation: {

    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },

    coordinates: [Number]

  },

  deliveryAddress: String,

  status: {

    type: String,

    enum: [
      "pending",
      "accepted",
      "picked",
      "on_the_way",
      "delivered",
      "cancelled"
    ],

    default: "pending"

  },

  /* ===============================
     Timeline
  ============================== */

  timeline: [

    {

      status: String,

      time: {
        type: Date,
        default: Date.now
      }

    }

  ],

  /* ===============================
     Financials
  ============================== */

  platformFee: Number,

  driverEarnings: Number

}, { timestamps: true });


OrderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", OrderSchema);