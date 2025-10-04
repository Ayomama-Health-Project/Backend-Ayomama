import {
  visitSchedule,
  getVisits,
  getVisitById,
  updateSpecificVisit,
  deleteVisit,
} from "../controllers/visitController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/create_schedule", protectRoute, visitSchedule);
router.get("/get_visits", protectRoute, getVisits);
router.get("/get_visit/:id", protectRoute, getVisitById);
router.put("/update_visit/:id", protectRoute, updateSpecificVisit);
router.delete("/delete_visit/:id", protectRoute, deleteVisit);

export default router;
