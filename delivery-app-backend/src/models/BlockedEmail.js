const mongoose = require("mongoose");

const blockedEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  reason: { type: String, trim: true },
  blockedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BlockedEmail", blockedEmailSchema);
