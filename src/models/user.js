import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      required: true,
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
      default: "",
    },

    lastPeriodDate: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      default: "",
    },

    preferredLanguages: {
      type: String,
      enum: ["en", "yo", "ig", "ha"],
      default: "en",
    },

    contact: {
      type: String,
      default: "",
    },

    emergencyContact: [
      {
        name: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        relationship: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true, versionKey: false } // small fix: "timestamps" not "timestamp"
);

export default mongoose.model("User", userSchema);
