import express from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import blogRoutes from "./blogRoutes.js";
import chatRoutes from "./chatRoutes.js";
import communityRoutes from "./communityRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import healthWorkerRoutes from "./healthWorkerRoutes.js";
import emergencyRoutes from "./emergencyRoutes.js";
import meRoutes from "./meRoutes.js";
import partnerInviteRoutes from "./partnerInviteRoutes.js";
import visitRoutes from "./visitRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/chat", chatRoutes);
router.use("/community", communityRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/healthworker", healthWorkerRoutes);
router.use("/emergency", emergencyRoutes);
router.use("/me", meRoutes);
router.use("/visits", visitRoutes);
router.use("/partner-invites", partnerInviteRoutes);
router.use("/admin", adminRoutes);

export default router;
