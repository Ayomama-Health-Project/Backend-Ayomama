import express from "express";
import {
  loginUser,
  postPartumLogin,
  signUp,
  postPartumSignUp,
  logoutUser,
  requestPasswordReset,
  verifyOTPAndResetPassword,
  getCurrentUser
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/current_user", protectRoute, getCurrentUser)

router.post("/register", signUp);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/reset", requestPasswordReset);
router.post("/verify", verifyOTPAndResetPassword);

// postpartum auth routes

router.post("/postpartum/register", postPartumSignUp);
router.post("/postpartum/login", postPartumLogin);


export default router;
