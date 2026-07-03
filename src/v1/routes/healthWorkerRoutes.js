import express from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createPatient,
  addHealthLog,
  logCHWVisit,
  getUpcomingVisits,
} from "../controllers/healthWorkerController.js";
import { getHealthWorkerDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    pregnancyStage: z.string().optional(),
    patientVisitDate: z.string().datetime().optional(),
    antinentalVisitDate: z.string().datetime().optional(),
    contact: z.string().min(1),
  }),
});

const addHealthLogSchema = z.object({
  body: z.object({
    pregnancyStage: z.string().optional(),
    visitDate: z.string().datetime().optional(),
    riskStatus: z.string().optional(),
    medicalHistory: z.string().optional(),
    temperature: z.number().optional(),
    weight: z.number().optional(),
    bloodLevel: z.number().optional(),
    bloodPressure: z.string().optional(),
  }),
});

const logVisitSchema = z.object({
  body: z.object({
    visitDate: z.string().datetime().optional(),
    antinentalVisitDate: z.string().datetime().optional(),
    contact: z.string().optional(),
  }),
});

router.use(requireAuth);
router.use(requireRoles("health_worker"));

router.post("/patients", validateRequest(createPatientSchema), createPatient);
router.post("/patients/:patientId/healthlogs", validateRequest(addHealthLogSchema), addHealthLog);
router.post("/patients/:patientId/visits", validateRequest(logVisitSchema), logCHWVisit);
router.get("/upcoming", getUpcomingVisits);
router.get("/dashboard", getHealthWorkerDashboardSummary);

export default router;
