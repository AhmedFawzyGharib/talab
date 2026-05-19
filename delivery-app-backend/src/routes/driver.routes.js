const express = require("express");
const router = express.Router();

const driverController = require("../controllers/driver.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

/* ===============================
   Driver Profile (self)
================================= */

router.get(
  "/me",
  auth,
  role("driver"),
  driverController.getDriverProfile
);

router.patch(
  "/me",
  auth,
  role("driver"),
  driverController.updateDriverProfile
);

/* ===============================
   Driver Self Actions
================================= */

router.put(
  "/online",
  auth,
  role("driver"),
  driverController.toggleOnline
);

router.put(
  "/location",
  auth,
  role("driver"),
  driverController.updateLocation
);

module.exports = router;
