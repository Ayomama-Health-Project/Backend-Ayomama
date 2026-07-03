import express from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createVisit, listVisits, updateVisit } from "../controllers/visitController.js";

const router = express.Router();

const createVisitSchema = z.object({
  body: z.object({
    serviceType: z.string().trim().min(1),
    hospitalName: z.string().trim().min(1),
    healthcareProvider: z.string().trim().min(1),
    scheduledFor: z.string().datetime(),
    durationMinutes: z.number().int().min(5).max(360).optional().default(30),
    notes: z.string().trim().optional().default(""),
    checklist: z.array(z.string()).optional().default([]),
  }),
});

router.use(requireAuth);
router.get("/", listVisits);
router.post("/", validateRequest(createVisitSchema), createVisit);
router.patch("/:visitId", validateRequest(createVisitSchema), updateVisit);

export default router;
