import mongoose from "mongoose";

const blockedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  reason: String,
  blockedAt: { type: Date, default: Date.now },
});

export default mongoose.model("BlockedEmail", blockedEmailSchema);