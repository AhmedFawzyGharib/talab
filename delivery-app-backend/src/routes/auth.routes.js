const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.post("/create-customer", controller.createCustomer);
router.post("/customer/register", controller.registerCustomer);
router.post("/customer/verify-otp", controller.verifyCustomerOtp);
router.post("/create-admin", controller.createAdmin);
router.post(
  "/driver/request-otp",
  controller.requestDriverOtp
);

router.post(
  "/driver/set-password",
  controller.verifyOtpAndSetPassword
);

router.post(
  "/driver/check-status",
  controller.checkApplicationStatus
);

module.exports = router;