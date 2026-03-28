import express from "express";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  changePasswordSchema,
  notificationTokenSchema,
  patchLanguageSchema,
  patchOnboardingSchema,
  patchProfileSchema,
} from "../validation/authSchemas.js";
import {
  changePassword,
  createNotificationToken,
  deleteNotificationToken,
  patchLanguage,
  patchOnboarding,
  patchProfile,
} from "../controllers/meController.js";

const router = express.Router();

router.use(requireAuth);
router.patch("/profile", validateRequest(patchProfileSchema), patchProfile);
router.patch("/password", validateRequest(changePasswordSchema), changePassword);
router.patch("/language", validateRequest(patchLanguageSchema), patchLanguage);
router.post("/notification-tokens", validateRequest(notificationTokenSchema), createNotificationToken);
router.delete("/notification-tokens/:id", deleteNotificationToken);
router.patch("/onboarding", validateRequest(patchOnboardingSchema), patchOnboarding);

export default router;
