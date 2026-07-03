import BlogPost from "../../models/BlogPost.js";
import { sendSuccess } from "../../utils/problem.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listPublishedBlogs(_req, res) {
  const blogs = await BlogPost.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();

  return sendSuccess(res, {
    message: "Blogs loaded successfully.",
    data: blogs.map((blog) => ({
      id: blog._id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      category: blog.category,
      language: blog.language,
      publishedAt: blog.publishedAt,
      reads: blog.reads,
    })),
  });
}

export async function listAdminBlogs(_req, res) {
  const blogs = await BlogPost.find().sort({ updatedAt: -1 }).lean();
  return sendSuccess(res, {
    message: "Admin blogs loaded successfully.",
    data: blogs,
  });
}

export async function createAdminBlog(req, res) {
  const body = req.validated.body;
  const blog = await BlogPost.create({
    title: body.title,
    slug: body.slug || slugify(body.title),
    excerpt: body.excerpt || "",
    content: body.content || "",
    coverImage: body.coverImage || "",
    category: body.category || "General",
    language: body.language || "en",
    status: body.status || "draft",
    authorAccount: req.account._id,
    publishedAt: body.status === "published" ? new Date() : null,
  });

  return sendSuccess(res, {
    status: 201,
    message: "Blog created successfully.",
    data: blog,
  });
}

export async function updateAdminBlog(req, res) {
  const body = req.validated.body;
  const nextStatus = body.status;

  const blog = await BlogPost.findByIdAndUpdate(
    req.params.id,
    {
      ...(typeof body.title !== "undefined" ? { title: body.title } : {}),
      ...(typeof body.slug !== "undefined" ? { slug: body.slug || slugify(body.title || "") } : {}),
      ...(typeof body.excerpt !== "undefined" ? { excerpt: body.excerpt } : {}),
      ...(typeof body.content !== "undefined" ? { content: body.content } : {}),
      ...(typeof body.coverImage !== "undefined" ? { coverImage: body.coverImage } : {}),
      ...(typeof body.category !== "undefined" ? { category: body.category } : {}),
      ...(typeof body.language !== "undefined" ? { language: body.language } : {}),
      ...(typeof nextStatus !== "undefined"
        ? {
            status: nextStatus,
            publishedAt: nextStatus === "published" ? new Date() : null,
          }
        : {}),
    },
    { new: true },
  );

  return sendSuccess(res, {
    message: "Blog updated successfully.",
    data: blog,
  });
}
