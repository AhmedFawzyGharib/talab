const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/login", controller.login);
router.post("/create-customer", auth, role("super_admin"), controller.createCustomer);
router.post("/customer/register", controller.registerCustomer);
router.post("/customer/verify-otp", controller.verifyCustomerOtp);
router.post("/create-admin", auth, role("super_admin"), controller.createAdmin);
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