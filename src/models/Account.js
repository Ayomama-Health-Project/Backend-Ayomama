import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
    userAgent: { type: String, default: "" },
  },
  { _id: true },
);

const passwordResetSchema = new mongoose.Schema(
  {
    otpHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    resendAvailableAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { _id: false },
);

const onboardingProgressSchema = new mongoose.Schema(
  {
    flow: { type: String, default: "" },
    currentStep: { type: Number, default: 0 },
    draft: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["mother", "partner", "health_worker", "admin", "super_admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_onboarding", "active", "suspended"],
      default: "pending_onboarding",
    },
    language: {
      type: String,
      enum: ["en", "yo", "ha", "ig"],
      default: "en",
    },
    isEmailVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    profilePicture: { type: String, default: "" },
    motherType: {
      type: String,
      enum: ["pregnant", "postpartum", null],
      default: null,
    },
    healthWorkerType: {
      type: String,
      enum: ["with_clinic", "without_clinic", null],
      default: null,
    },
    lastLoginAt: { type: Date, default: null },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    passwordReset: {
      type: passwordResetSchema,
      default: () => ({}),
    },
    onboardingProgress: {
      type: onboardingProgressSchema,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Account || mongoose.model("Account", accountSchema);
