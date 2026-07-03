import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    ownerMotherAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    serviceType: { type: String, default: "Antenatal Visit" },
    hospitalName: { type: String, default: "" },
    healthcareProvider: { type: String, default: "" },
    scheduledFor: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    notes: { type: String, default: "" },
    checklist: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
