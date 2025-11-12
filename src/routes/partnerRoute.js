import express from "express";
import { createInvite, verifyInvite, partnerSignup } from "../controllers/partnerController.js";
import {protectRoute} from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/invite", protectRoute, createInvite);

// Partner verifies invite link
router.get("/verify", verifyInvite);

// Partner signup using invite token
router.post("/signup", partnerSignup);

export default router;
