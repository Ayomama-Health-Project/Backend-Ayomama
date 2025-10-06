import {logVisit} from '../controllers/patientController.js';
import express from 'express'

const router = express.Router();

router.post('/log-visit', logVisit);

export default router;