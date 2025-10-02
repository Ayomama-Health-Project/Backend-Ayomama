import {visitSchedule, getVisits} from '../controllers/visitController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import express from 'express'

const router = express.Router()


router.post("/create_schedule", authMiddleware, visitSchedule);
router.get("/get_visits", authMiddleware, getVisits);

export default router;

