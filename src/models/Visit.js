import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: true,
    },
    reminderDateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
    },
    notes: {
      type: String,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Visit", visitSchema);
