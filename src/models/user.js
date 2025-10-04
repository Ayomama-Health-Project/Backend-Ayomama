import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    lastPeriodDate: {
      type: Date,
    },
    address: {
      type: String,
    },
    preferredLanguages: {
      type: String,
      enum: ["en", "yo", "ig", "ha"],
      default: "en",
    },
    emergencyContact: [
      {
        name: String,
        phone: String,
        email: String,
        relationship: String,
      },
    ],
  },
  { timestamp: true, versionKey: false }
);

export default mongoose.model("User", userSchema);
