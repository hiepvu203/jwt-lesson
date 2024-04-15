const router = require("express").Router();
const authController = require("../controller/AuthController");
const middlewareController = require("../controller/middlewareController");

//register
router.post("/register", authController.registerUser);

//login
router.post("/login", authController.loginUser);

// refresh
router.post("/refresh", authController.refreshToken);

// logout
router.post("/logout", middlewareController.verifyToken, authController.logoutUser);

module.exports = router;