import express from "express";
import {
  loginUser,
  signUp,
  // getProfile,
  logoutUser,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { validateRequest } from "zod-express-middleware";
import { loginSchema, registerSchema } from "../middleware/validateSchema.js";

const router = express.Router();

router.post("/register", validateRequest({ body: registerSchema }), signUp);
router.post("/login", validateRequest({ body: loginSchema }), loginUser);
// router.get("/me", protectRoute, getProfile);
router.post("/logout", protectRoute, logoutUser);

export default router;
