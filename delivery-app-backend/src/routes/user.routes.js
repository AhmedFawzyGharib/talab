const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const imageUpload = require("../middlewares/imageUpload");

router.get("/me", auth, controller.getProfile);
router.patch("/me", auth, controller.updateProfile);
router.patch("/me/password", auth, controller.changePassword);
router.post("/me/avatar", auth, imageUpload.single("avatar"), controller.uploadAvatar);

module.exports = router;
