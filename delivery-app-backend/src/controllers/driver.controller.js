const Driver = require("../models/Driver");

/* ===============================
   Toggle Online
================================= */
const toggleOnline = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isOnline = !driver.isOnline;
    await driver.save();

    res.json({
      message: "Status updated",
      isOnline: driver.isOnline,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================
   Update Location
================================= */
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.location = {
      type: "Point",
      coordinates: [lng, lat],
    };

    await driver.save();

    res.json({ message: "Location updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  toggleOnline,
  updateLocation,
};