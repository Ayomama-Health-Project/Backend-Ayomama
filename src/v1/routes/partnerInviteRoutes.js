import express from "express";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createPartnerInvite, getPartnerInvite, acceptPartnerInvite } from "../controllers/partnerInviteController.js";
import { inviteParamsSchema, inviteSchema } from "../validation/authSchemas.js";

const router = express.Router();

router.post("/", requireAuth, validateRequest(inviteSchema), createPartnerInvite);
router.get("/:token", validateRequest(inviteParamsSchema), getPartnerInvite);
router.post("/:token/accept", requireAuth, validateRequest(inviteParamsSchema), acceptPartnerInvite);

export default router;
