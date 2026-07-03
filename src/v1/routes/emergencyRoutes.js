import express from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { listNearbyHospitals } from "../controllers/emergencyController.js";

const router = express.Router();

const nearbyHospitalsSchema = z.object({
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
});

router.use(requireAuth);
router.get("/hospitals", validateRequest(nearbyHospitalsSchema), listNearbyHospitals);

export default router;
