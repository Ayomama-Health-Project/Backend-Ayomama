import express from "express";
import { requireAuth } from "../../middleware/authV1.js";
import { getDashboardSummary, toggleChecklistItem, updateDashboardState } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(requireAuth);
router.get("/summary", getDashboardSummary);
router.patch("/summary", updateDashboardState);
router.patch("/checklist/:itemId/toggle", toggleChecklistItem);

export default router;
