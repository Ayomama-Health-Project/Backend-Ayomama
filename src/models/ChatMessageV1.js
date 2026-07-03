import mongoose from "mongoose";

const chatMessageV1Schema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    conversationKey: { type: String, default: "primary", index: true },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.ChatMessageV1 ||
  mongoose.model("ChatMessageV1", chatMessageV1Schema);
