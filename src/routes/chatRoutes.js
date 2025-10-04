import { Router } from "express";
import { chatWithAi } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/send", protectRoute, chatWithAi);

export default router;
