import express from "express";
import { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, verifyOTP } from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validator.js";
import registerValidator from "../validators/registerValidator.js";
import loginValidator from "../validators/loginValidator.js";

const router = express.Router();

router.post("/register", validate(registerValidator), registerUser);
router.post("/login", validate(loginValidator), loginUser);
router.post("/logout", auth, logoutUser);
router.post("/verify", verifyOTP);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;