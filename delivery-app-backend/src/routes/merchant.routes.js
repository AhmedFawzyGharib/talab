const router = require("express").Router();
const merchantController = require("../controllers/merchant.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

// Admin ينشئ
router.post("/", auth, role("admin"), merchantController.createMerchant);

// الجميع يشاهد
router.get("/", merchantController.getMerchants);
router.get("/:id", merchantController.getMerchantById);

module.exports = router;