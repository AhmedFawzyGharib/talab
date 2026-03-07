const router = require("express").Router();
const productController = require("../controllers/product.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/", auth, role("admin"), productController.createProduct);

router.get("/merchant/:merchantId",
  productController.getProductsByMerchant
);

module.exports = router;