
const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", authController.getCurrentUser);
router.post("/logout", authController.logoutUser);

module.exports = router;
