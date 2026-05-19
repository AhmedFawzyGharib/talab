const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const adminController = require("../controllers/admin.controller");
const upload = require("../middlewares/upload");

/* ===============================
   DASHBOARD
================================= */

router.get(
  "/stats",
  auth,
  role("admin", "super_admin"),
  adminController.getDashboardStats
);

/* ===============================
   ORDERS
================================= */

router.get(
  "/orders",
  auth,
  role("admin", "super_admin"),
  adminController.getAllOrders
);

router.patch(
  "/orders/:id/cancel",
  auth,
  role("admin", "super_admin"),
  adminController.cancelOrder
);

router.get(
  "/drivers-list",
  auth,
  role("admin", "super_admin"),
  adminController.getAvailableDrivers
);

router.patch(
  "/orders/:id/assign-driver",
  auth,
  role("admin", "super_admin"),
  adminController.assignDriver
);

/* ===============================
   DRIVER APPLICATIONS
================================= */

router.get(
  "/driver-applications",
  auth,
  role("admin", "super_admin"),
  adminController.getDriverApplications
);

router.patch(
  "/driver-applications/:id",
  auth,
  role("admin", "super_admin"),
  adminController.updateDriverStatus
);

/* ===============================
   DRIVERS
================================= */

router.get(
  "/drivers",
  auth,
  role("admin", "super_admin"),
  adminController.getDrivers
);

/* ===============================
   MERCHANT APPLICATIONS
================================= */

router.get(
  "/merchant-applications",
  auth,
  role("admin", "super_admin"),
  adminController.getMerchantApplications
);

router.patch(
  "/merchant-applications/:id",
  auth,
  role("admin", "super_admin"),
  adminController.updateMerchantStatus
);

/* ===============================
   MERCHANTS
================================= */

router.get(
  "/merchants",
  auth,
  role("admin", "super_admin"),
  adminController.getMerchants
);

router.post(
  "/merchants",
  auth,
  role("admin", "super_admin"),
  adminController.createMerchant
);

router.delete(
  "/merchants/:id",
  auth,
  role("admin", "super_admin"),
  adminController.deleteMerchant
);

router.patch(
  "/merchants/:id/toggle",
  auth,
  role("admin", "super_admin"),
  adminController.toggleMerchantStatus
);

/* ===============================
   PRODUCTS
================================= */

router.post(
  "/products",
  auth,
  role("admin"),
  upload.single("image"),
  adminController.createProduct
);

router.get(
  "/products",
  auth,
  role("admin"),
  adminController.getProducts
);

router.delete(
  "/products/:id",
  auth,
  role("admin", "super_admin"),
  adminController.deleteProduct
);

router.patch(
  "/products/:id/toggle",
  auth,
  role("admin", "super_admin"),
  adminController.toggleProductStatus
);

/* ===============================
   WITHDRAW
================================= */

router.get(
  "/withdraws",
  auth,
  role("admin", "super_admin"),
  adminController.getWithdrawRequests
);

router.patch(
  "/withdraws/:id",
  auth,
  role("admin", "super_admin"),
  adminController.updateWithdrawStatus
);

/* ===============================
   BLOCKED EMAILS
================================= */

router.get(
  "/blocked-emails",
  auth,
  role("admin", "super_admin"),
  adminController.getBlockedEmails
);

router.post(
  "/blocked-emails",
  auth,
  role("admin", "super_admin"),
  adminController.blockEmail
);

router.delete(
  "/blocked-emails/:id",
  auth,
  role("admin", "super_admin"),
  adminController.unblockEmail
);

/* ===============================
   USERS (super_admin only)
================================= */

router.get(
  "/users",
  auth,
  role("super_admin"),
  adminController.getUsers
);

router.post(
  "/users",
  auth,
  role("super_admin"),
  adminController.createUserByAdmin
);

module.exports = router;