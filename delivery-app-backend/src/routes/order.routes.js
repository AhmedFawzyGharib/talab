const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const orderController = require("../controllers/order.controller");

// 🔥 مهم جدًا: routes الثابتة قبل :id

// Customer
router.post(
  "/",
  auth,
  role("customer"),
  orderController.createOrder
);

router.get(
  "/my",
  auth,
  role("customer"),
  orderController.getMyOrders
);

router.post(
  "/custom-delivery",
  auth,
  orderController.createCustomDelivery
);
// Driver
router.get(
  "/available",
  auth,
  role("driver"),
  orderController.getAvailableOrders
);

router.get(
  "/driver/active",
  auth,
  role("driver"),
  orderController.getActiveDriverOrder
);

router.put(
  "/:id/accept",
  auth,
  role("driver"),
  orderController.acceptOrder
);

router.put(
  "/:id/status",
  auth,
  role("driver"),
  orderController.updateOrderStatus
);

module.exports = router;