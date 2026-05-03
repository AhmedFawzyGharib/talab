require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      tls: true,
      retryWrites: true,
    });
    console.log("✅ Connected to MongoDB");

    const phone = "01201255419";
    const password = "01201255419";
    const name = "Super Admin";

    const existing = await User.findOne({ phone });
    if (existing) {
      existing.role = "super_admin";
      existing.password = await bcrypt.hash(password, 10);
      existing.name = name;
      existing.isBlocked = false;
      await existing.save();
      console.log("✅ Existing user upgraded to super_admin:", phone);
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
