import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    authorAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false },
);

const commentSchema = new mongoose.Schema(
  {
    authorAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1500 },
    replies: { type: [replySchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false },
);

const communityPostSchema = new mongoose.Schema(
  {
    authorAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "Account", default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.CommunityPost || mongoose.model("CommunityPost", communityPostSchema);
