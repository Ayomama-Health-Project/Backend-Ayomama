import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createAntenatalUpdate } from "../controllers/antenatalController.js";

const router = Router();

router.post("/", protectRoute, createAntenatalUpdate);

export default router;
