const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: true
  },

  name: String,

  price: Number,

  quantity: {
    type: Number,
    default: 0
  },

  description: String,

  image: String,

  isAvailable: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);