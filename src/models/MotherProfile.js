import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    relationship: { type: String, default: "" },
  },
  { _id: true },
);

const motherProfileSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    fullName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
    dueDate: { type: Date, default: null },
    lastPeriodDate: { type: Date, default: null },
    pregnancyWeek: { type: Number, default: null },
    antenatalProvider: { type: String, default: "" },
    babyName: { type: String, default: "" },
    babyNickname: { type: String, default: "" },
    babyBirthDate: { type: Date, default: null },
    babyBirthWeight: { type: String, default: "" },
    babyBirthHospital: { type: String, default: "" },
    babyGender: { type: String, default: "" },
    healthConcerns: { type: String, default: "" },
    supportCircle: { type: [String], default: [] },
    quickSetupSelections: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.MotherProfile || mongoose.model("MotherProfile", motherProfileSchema);
