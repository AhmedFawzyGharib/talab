const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // يسمح بعدم وجوده لبعض الأدوار
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "customer",
        "driver",
        "merchant",
        "admin",
        "super_admin",
      ],
      default: "customer",
    },

      status: {
        type: String,
         enum: [
               "active",
              "inactive",
               "blocked",
                "pending_password"
                 ],
                   default: "active"
          },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    // Geo Location (للسائق فقط)
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
  },
  { timestamps: true }
);

/* ===============================
   Indexes
================================= */

// Geo Index
UserSchema.index({ location: "2dsphere" });

// Email index
UserSchema.index({ email: 1 });

// Phone index
UserSchema.index({ phone: 1 });

module.exports = mongoose.model("User", UserSchema);