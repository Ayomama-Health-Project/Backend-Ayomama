import express from "express";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  changePasswordSchema,
  notificationTokenSchema,
  patchLanguageSchema,
  patchMotherTypeSchema,
  patchOnboardingSchema,
  patchProfileSchema,
} from "../validation/authSchemas.js";
import {
  changePassword,
  createNotificationToken,
  deleteNotificationToken,
  getNotificationFeed,
  patchLanguage,
  patchMotherType,
  patchOnboarding,
  patchProfile,
} from "../controllers/meController.js";

const router = express.Router();

router.use(requireAuth);
router.patch("/profile", validateRequest(patchProfileSchema), patchProfile);
router.patch("/password", validateRequest(changePasswordSchema), changePassword);
router.patch("/language", validateRequest(patchLanguageSchema), patchLanguage);
router.patch("/mother-type", validateRequest(patchMotherTypeSchema), patchMotherType);
router.get("/notifications", getNotificationFeed);
router.post("/notification-tokens", validateRequest(notificationTokenSchema), createNotificationToken);
router.delete("/notification-tokens/:id", deleteNotificationToken);
router.patch("/onboarding", validateRequest(patchOnboardingSchema), patchOnboarding);

export default router;
