import mongoose from "mongoose";
import crypto from "crypto";

const partnerInviteSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // pregnant mother
  invitedEmail: String,
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 } // expires in 7 days
});

// Auto-delete expired tokens
partnerInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PartnerInvite", partnerInviteSchema);
