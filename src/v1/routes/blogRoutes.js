import express from "express";
import { z } from "zod";
import { requireAuth, requireRoles } from "../../middleware/authV1.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createAdminBlog,
  listAdminBlogs,
  listPublishedBlogs,
  updateAdminBlog,
} from "../controllers/blogController.js";

const router = express.Router();

const blogBody = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  category: z.string().trim().optional(),
  language: z.enum(["en", "yo", "ha", "ig"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

router.get("/", listPublishedBlogs);
router.get("/admin", requireAuth, requireRoles("admin", "super_admin"), listAdminBlogs);
router.post(
  "/admin",
  requireAuth,
  requireRoles("admin", "super_admin"),
  validateRequest(z.object({ body: blogBody })),
  createAdminBlog,
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRoles("admin", "super_admin"),
  validateRequest(z.object({ body: blogBody.partial(), params: z.object({ id: z.string().trim().min(1) }) })),
  updateAdminBlog,
);

export default router;
