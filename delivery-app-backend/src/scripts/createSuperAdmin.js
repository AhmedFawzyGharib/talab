require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  try {
    const phone = process.env.SUPER_ADMIN_PHONE;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

    if (!phone || !password) {
      console.error("❌ SUPER_ADMIN_PHONE and SUPER_ADMIN_PASSWORD must be set in environment");
      process.exit(1);
    }
    if (password.length < 12) {
      console.error("❌ SUPER_ADMIN_PASSWORD must be at least 12 characters");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      tls: true,
      retryWrites: true,
    });
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ phone });
    if (existing) {
      existing.role = "super_admin";
      existing.name = name;
      await existing.save();
      console.log("✅ Existing user upgraded to super_admin:", phone);
      console.log("ℹ️  Password NOT reset. To rotate, delete the user first then re-run.");
    } else {
      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        name,
        phone,
        password: hashed,
        role: "super_admin",
      });
      console.log("✅ Super admin created:", phone);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
})();
