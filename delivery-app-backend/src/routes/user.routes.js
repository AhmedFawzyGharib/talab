const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/me", auth, controller.getProfile);
router.patch("/me", auth, controller.updateProfile);
router.patch("/me/password", auth, controller.changePassword);

module.exports = router;
