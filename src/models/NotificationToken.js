import mongoose from "mongoose";

const notificationTokenSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    platform: { type: String, enum: ["ios", "android", "web"], required: true },
    expoPushToken: { type: String, required: true },
    deviceId: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

notificationTokenSchema.index({ account: 1, expoPushToken: 1 }, { unique: true });

export default mongoose.models.NotificationToken ||
  mongoose.model("NotificationToken", notificationTokenSchema);
