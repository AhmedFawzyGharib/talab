const express = require("express");
const router = express.Router();

const driverController = require("../controllers/driver.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

/* ===============================
   Driver Self Actions
================================= */

// Toggle Online / Offline
router.put(
  "/online",
  auth,
  role("driver"),
  driverController.toggleOnline
);

// Update Location
router.put(
  "/location",
  auth,
  role("driver"),
  driverController.updateLocation
);

module.exports = router;