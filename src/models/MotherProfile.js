import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    relationship: { type: String, default: "" },
  },
  { _id: true },
);

const checklistItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    label: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    iconKey: { type: String, default: "" },
  },
  { _id: true },
);

const medicationReminderSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    dosage: { type: String, default: "" },
    timeLabel: { type: String, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    enabled: { type: Boolean, default: true },
  },
  { _id: true },
);

const vitalOverviewSchema = new mongoose.Schema(
  {
    bloodPressure: { type: String, default: "" },
    weight: { type: String, default: "" },
    temperature: { type: String, default: "" },
    bloodLevel: { type: String, default: "" },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const wellnessActivitySchema = new mongoose.Schema(
  {
    activityId: { type: String, default: "" },
    title: { type: String, default: "" },
    meta: { type: String, default: "" },
    icon: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
  },
  { _id: true },
);

const nutritionItemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["Breakfast", "Lunch", "Dinner"], default: "Breakfast" },
    meal: { type: String, default: "" },
    weight: { type: String, default: "" },
    macroA: { type: String, default: "" },
    macroB: { type: String, default: "" },
    macroC: { type: String, default: "" },
  },
  { _id: true },
);

const journalEntrySchema = new mongoose.Schema(
  {
    body: { type: String, default: "" },
    meta: { type: String, default: "" },
    createdAtLabel: { type: String, default: "" },
  },
  { _id: true },
);

const developmentSnapshotSchema = new mongoose.Schema(
  {
    stageLabel: { type: String, default: "" },
    sizeComparison: { type: String, default: "" },
    headline: { type: String, default: "" },
    milestones: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
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
    checklistItems: { type: [checklistItemSchema], default: [] },
    checklistLastResetAt: { type: Date, default: null },
    medicationReminders: { type: [medicationReminderSchema], default: [] },
    vitalsOverview: {
      type: vitalOverviewSchema,
      default: () => ({}),
    },
    wellnessActivities: { type: [wellnessActivitySchema], default: [] },
    nutritionPlan: { type: [nutritionItemSchema], default: [] },
    journalEntries: { type: [journalEntrySchema], default: [] },
    developmentSnapshot: {
      type: developmentSnapshotSchema,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.MotherProfile || mongoose.model("MotherProfile", motherProfileSchema);
