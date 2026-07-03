import express from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  registerHealthWorker,
  registerMother,
  registerPartner,
  resetPassword,
  verifyResetOtp,
} from "../controllers/authController.js";
import { listHealthProfessionals as listHealthProfessionalsController } from "../controllers/healthProfessionalController.js";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerHealthWorkerSchema,
  registerMotherSchema,
  registerPartnerSchema,
  resetPasswordSchema,
  otpSchema,
} from "../validation/authSchemas.js";

const router = express.Router();

router.post("/register/mother", validateRequest(registerMotherSchema), registerMother);
router.post("/register/partner", validateRequest(registerPartnerSchema), registerPartner);
router.post("/register/health-worker", validateRequest(registerHealthWorkerSchema), registerHealthWorker);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", validateRequest(refreshSchema), refresh);
router.post("/logout", requireAuth, logout);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-otp", validateRequest(otpSchema), verifyResetOtp);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);
router.get("/me", requireAuth, me);
router.get("/health-professionals", requireAuth, listHealthProfessionalsController);

export default router;
