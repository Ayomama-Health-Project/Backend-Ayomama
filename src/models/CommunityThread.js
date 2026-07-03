import mongoose from "mongoose";

const threadMessageSchema = new mongoose.Schema(
  {
    senderAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false },
);

const communityThreadSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true, maxlength: 160 },
    participantAccounts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Account",
      default: [],
      validate: [(value) => value.length > 0, "At least one participant is required."],
    },
    targetHealthWorkerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    latestMessageAt: { type: Date, default: Date.now },
    messages: { type: [threadMessageSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.CommunityThread || mongoose.model("CommunityThread", communityThreadSchema);
