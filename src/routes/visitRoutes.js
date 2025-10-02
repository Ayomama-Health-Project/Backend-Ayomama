import {visitSchedule, getVisits, getVisitById, updateSpecificVisit, deleteVisit} from '../controllers/visitController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import express from 'express'

const router = express.Router()


router.post("/create_schedule", authMiddleware, visitSchedule);
router.get("/get_visits", authMiddleware, getVisits);
router.get("/get_visit/:id", authMiddleware, getVisitById);
router.put("/update_visit/:id", authMiddleware, updateSpecificVisit)
router.delete("/delete_visit/:id", authMiddleware, deleteVisit)


export default router;

