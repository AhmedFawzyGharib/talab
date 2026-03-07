const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
{
  /* ===============================
     TYPE
  =============================== */

  type: {
    type: String,
    enum: ["merchant", "custom"],
    default: "merchant"
  },

  /* ===============================
     RELATIONS
  =============================== */

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

  /* ===============================
     CUSTOM DELIVERY PICKUPS
  =============================== */

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

        coordinates: {
          type: [Number]
        }
      }
    }
  ],

  /* ===============================
     PRODUCTS
  =============================== */

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

  /* ===============================
     PRICE
  =============================== */

  subtotal: Number,
  deliveryFee: Number,
  totalPrice: Number,

  platformFee: Number,
  driverEarnings: Number,

  /* ===============================
     DELIVERY LOCATION
  =============================== */

  deliveryLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number]
  },

  deliveryAddress: String,

  /* ===============================
     STATUS
  =============================== */

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
  }

},
{ timestamps: true }
);

OrderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", OrderSchema);