const bcrypt = require("bcryptjs");
const User = require("../models/User");

const PHONE_REGEX = /^01[0125]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

/* ===============================
   GET CURRENT USER PROFILE
================================= */
exports.getProfile = async (req, res) => {
  try {
    res.json(sanitizeUser(req.user));
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   UPDATE PROFILE (name, phone, email)
================================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
        return res.status(400).json({
          message: "Phone must be 11 digits starting with 010/011/012/015",
        });
      }
      if (phone !== req.user.phone) {
        const exists = await User.findOne({ phone, _id: { $ne: req.user._id } });
        if (exists) {
          return res.status(400).json({ message: "Phone already in use" });
        }
        updates.phone = phone;
      }
    }

    if (email !== undefined) {
      if (email === "" || email === null) {
        updates.email = null;
      } else {
        if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
        const normalized = email.trim().toLowerCase();
        if (normalized !== (req.user.email || "").toLowerCase()) {
          const exists = await User.findOne({
            email: normalized,
            _id: { $ne: req.user._id },
          });
          if (exists) {
            return res.status(400).json({ message: "Email already in use" });
          }
          updates.email = normalized;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated", user: sanitizeUser(updated) });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   CHANGE PASSWORD
================================= */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
