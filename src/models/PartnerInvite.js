import mongoose from "mongoose";

const partnerInviteSchema = new mongoose.Schema({
  inviterAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  invitedEmail: { type: String, default: "" },
  inviteType: { type: String, enum: ["partner"], default: "partner" },
  token: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
  inviteCode: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 },
  usedAt: { type: Date, default: null },
  acceptedByAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
}, { timestamps: true, versionKey: false });

// Auto-delete expired tokens
partnerInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PartnerInvite || mongoose.model("PartnerInvite", partnerInviteSchema);
