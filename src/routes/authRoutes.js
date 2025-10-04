import express from "express";
import {
  loginUser,
  signUp,
  getProfile,
  logoutUser,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/login", loginUser);
router.get("/me", protectRoute, getProfile);
router.post("/logout", protectRoute, logoutUser);

export default router;
