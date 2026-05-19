const Driver = require("../models/Driver");

/* ===============================
   Toggle Online
================================= */

const toggleOnline = async (req, res) => {

  try {

    const driver = await Driver.findOne({
      userId: req.user._id
    });

    if (!driver) {

      return res.status(404).json({
        message: "Driver not found"
      });

    }

    driver.isOnline = !driver.isOnline;

    await driver.save();

    res.json({
      message: "Status updated",
      isOnline: driver.isOnline
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};


/* ===============================
   Update Location
================================= */

const updateLocation = async (req, res) => {

  try {

    const { lat, lng } = req.body;

    const driver = await Driver.findOne({
      userId: req.user._id
    });

    if (!driver) {

      return res.status(404).json({
        message: "Driver not found"
      });

    }

    driver.currentLocation = {

      type: "Point",
      coordinates: [lng, lat]

    };

    await driver.save();

    res.json({
      message: "Location updated"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

/* ===============================
   Get Driver Profile (self)
================================= */

const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }
    res.json({
      _id: driver._id,
      vehicleType: driver.vehicleType,
      vehicleNumber: driver.vehicleNumber || null,
      isOnline: driver.isOnline,
    });
  } catch (err) {
    console.error("GET DRIVER PROFILE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Update Driver Profile (self)
================================= */

const updateDriverProfile = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber } = req.body;

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    const updates = {};

    if (vehicleType !== undefined) {
      const allowed = ["bike", "car", "motorcycle"];
      if (typeof vehicleType !== "string" || !allowed.includes(vehicleType)) {
        return res.status(400).json({ message: "Invalid vehicle type" });
      }
      updates.vehicleType = vehicleType;
    }

    if (vehicleNumber !== undefined) {
      if (vehicleNumber === "" || vehicleNumber === null) {
        updates.vehicleNumber = null;
      } else {
        if (typeof vehicleNumber !== "string") {
          return res.status(400).json({ message: "Invalid vehicle number" });
        }
        const trimmed = vehicleNumber.trim();
        if (trimmed.length < 2 || trimmed.length > 20) {
          return res
            .status(400)
            .json({ message: "Vehicle number must be 2-20 characters" });
        }
        updates.vehicleNumber = trimmed;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    Object.assign(driver, updates);
    await driver.save();

    res.json({
      message: "Driver profile updated",
      driver: {
        _id: driver._id,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber || null,
        isOnline: driver.isOnline,
      },
    });
  } catch (err) {
    console.error("UPDATE DRIVER PROFILE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  toggleOnline,
  updateLocation,
  getDriverProfile,
  updateDriverProfile,
};