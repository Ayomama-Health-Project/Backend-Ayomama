import mongoose from "mongoose";

const healthWorkerFollowSchema = new mongoose.Schema(
  {
    followerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    healthWorkerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  },
  { timestamps: true, versionKey: false },
);

healthWorkerFollowSchema.index(
  { followerAccount: 1, healthWorkerAccount: 1 },
  { unique: true },
);

export default mongoose.models.HealthWorkerFollow || mongoose.model("HealthWorkerFollow", healthWorkerFollowSchema);
