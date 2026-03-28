import mongoose from "mongoose";

const partnerProfileSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    fullName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    relationshipLabel: { type: String, default: "" },
    linkedMotherAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    inviteAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.PartnerProfile || mongoose.model("PartnerProfile", partnerProfileSchema);
