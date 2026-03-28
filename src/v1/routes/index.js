import express from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import meRoutes from "./meRoutes.js";
import partnerInviteRoutes from "./partnerInviteRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/me", meRoutes);
router.use("/partner-invites", partnerInviteRoutes);
router.use("/admin", adminRoutes);

export default router;
