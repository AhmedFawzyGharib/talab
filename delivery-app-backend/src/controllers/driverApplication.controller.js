const DriverApplication = require("../models/DriverApplication");

/* ===============================
   Apply Driver
================================= */
const applyDriver = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      nationalId,
      licenseNumber,
      vehicleType,
      documents,
    } = req.body;

    const existing = await DriverApplication.findOne({
      phone,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Application already submitted",
      });
    }

    const application = await DriverApplication.create({
      fullName,
      email,
      phone,
      nationalId,
      licenseNumber,
      vehicleType,
      documents,
      status: "pending",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });

  } catch (err) {
    console.error("Apply Driver Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Check Status
================================= */
const checkStatus = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required",
      });
    }

    const application =
      await DriverApplication.findOne({ phone });

    if (!application) {
      return res.json({ status: "none" });
    }

    res.json({ status: application.status });

  } catch (err) {
    console.error("Check Status Error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  applyDriver,
  checkStatus,
};