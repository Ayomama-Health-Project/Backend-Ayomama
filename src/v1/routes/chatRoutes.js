import express from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { clearMessages, createMessage, listMessages } from "../controllers/chatController.js";

const router = express.Router();

router.use(requireAuth);
router.get("/messages", listMessages);
router.delete("/messages", clearMessages);
router.post(
  "/messages",
  validateRequest(
    z.object({
      body: z.object({
        content: z.string().trim().min(1).max(4000),
      }),
    }),
  ),
  createMessage,
);

export default router;
