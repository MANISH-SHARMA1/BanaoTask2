const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);
router.get("/refresh", authController.refreshAccessTokenController);
router.get("/logout", authController.logoutController);
router.post("/forgetPassword", authController.forgetPasswordController)
router.put("/resetPassword/:token", authController.resetPasswordController)

module.exports = router;