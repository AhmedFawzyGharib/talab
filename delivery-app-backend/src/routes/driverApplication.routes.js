const express = require("express");
const router = express.Router();

const controller = require("../controllers/driverApplication.controller");

/* ===============================
   Driver Apply (From App Only)
================================= */

router.post("/apply", controller.applyDriver);

/* ===============================
   Check Application Status
================================= */

router.get("/status", controller.checkStatus);

module.exports = router;