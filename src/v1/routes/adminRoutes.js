import express from "express";
import { requireAuth, requireRoles } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { adminLogin, adminForgotPassword, adminResetPassword } from "../controllers/authController.js";
import { adminMe, createAdmin, listAdmins, updateAccountStatus, updateAdmin } from "../controllers/adminController.js";
import {
  createAdminSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateAccountStatusSchema,
  updateAdminSchema,
} from "../validation/authSchemas.js";

const router = express.Router();

router.post("/auth/login", validateRequest(loginSchema), adminLogin);
router.post("/auth/forgot-password", validateRequest(forgotPasswordSchema), adminForgotPassword);
router.post("/auth/reset-password", validateRequest(resetPasswordSchema), adminResetPassword);
router.get("/me", requireAuth, requireRoles("admin", "super_admin"), adminMe);
router.post("/admins", requireAuth, requireRoles("super_admin"), validateRequest(createAdminSchema), createAdmin);
router.get("/admins", requireAuth, requireRoles("admin", "super_admin"), listAdmins);
router.patch("/admins/:id", requireAuth, requireRoles("super_admin"), validateRequest(updateAdminSchema), updateAdmin);
router.patch("/accounts/:id/status", requireAuth, requireRoles("super_admin"), validateRequest(updateAccountStatusSchema), updateAccountStatus);

export default router;
