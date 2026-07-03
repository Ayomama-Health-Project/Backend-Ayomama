import express from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  addCommunityComment,
  createCommunityPost,
  createCommunityThread,
  createThreadMessage,
  listCommunityHealthWorkers,
  listCommunityPosts,
  listCommunityThreads,
  listThreadMessages,
  toggleCommunityPostLike,
  toggleHealthWorkerFollow,
} from "../controllers/communityController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/posts", listCommunityPosts);
router.post(
  "/posts",
  validateRequest(
    z.object({
      body: z.object({
        content: z.string().trim().min(1).max(4000),
      }),
    }),
  ),
  createCommunityPost,
);
router.post("/posts/:postId/likes", toggleCommunityPostLike);
router.post(
  "/posts/:postId/comments",
  validateRequest(
    z.object({
      body: z.object({
        content: z.string().trim().min(1).max(1500),
        parentCommentId: z.string().trim().optional(),
      }),
    }),
  ),
  addCommunityComment,
);

router.get("/threads", listCommunityThreads);
router.post(
  "/threads",
  validateRequest(
    z.object({
      body: z.object({
        title: z.string().trim().max(160).optional(),
        targetAccountId: z.string().trim().optional(),
        content: z.string().trim().max(4000).optional(),
      }),
    }),
  ),
  createCommunityThread,
);
router.get("/threads/:threadId/messages", listThreadMessages);
router.post(
  "/threads/:threadId/messages",
  validateRequest(
    z.object({
      body: z.object({
        content: z.string().trim().min(1).max(4000),
      }),
    }),
  ),
  createThreadMessage,
);

router.get("/health-workers", listCommunityHealthWorkers);
router.post("/health-workers/:workerId/follow", toggleHealthWorkerFollow);

export default router;
