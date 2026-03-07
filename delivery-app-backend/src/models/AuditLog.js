const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    targetId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditSchema);