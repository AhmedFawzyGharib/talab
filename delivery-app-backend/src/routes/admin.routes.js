const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

const adminController = require("../controllers/admin.controller");
const upload = require("../middlewares/upload");

/* ===============================
   Dashboard
================================= */
router.get(
  "/dashboard",
  auth,
  role("admin", "super_admin"),
  adminController.getDashboardStats
);

/* ===============================
   Driver Applications
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
   Drivers
================================= */
router.get(
  "/drivers",
  auth,
  role("admin", "super_admin"),
  adminController.getDrivers
);

/* ===============================
   Merchant Applications
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
   Merchants CRUD
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

router.put(
  "/merchants/:id",
  auth,
  role("admin", "super_admin"),
  adminController.updateMerchant
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
   Products CRUD
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

router.put(
  "/products/:id",
  auth,
  role("admin", "super_admin"),
  adminController.updateProduct
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
   Withdraw
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

module.exports = router;