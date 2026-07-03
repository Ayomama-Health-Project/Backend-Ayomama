import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "General" },
    language: {
      type: String,
      enum: ["en", "yo", "ha", "ig"],
      default: "en",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    authorAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    publishedAt: { type: Date, default: null },
    reads: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);
