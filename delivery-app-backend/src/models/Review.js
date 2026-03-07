const reviewSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  driverRating: Number,
  restaurantRating: Number,
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);