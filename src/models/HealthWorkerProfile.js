import mongoose from "mongoose";

const healthWorkerProfileSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    fullName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    state: { type: String, default: "" },
    localGovernment: { type: String, default: "" },
    occupation: { type: String, default: "" },
    facilityName: { type: String, default: "" },
    facilityCode: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.HealthWorkerProfile || mongoose.model("HealthWorkerProfile", healthWorkerProfileSchema);
