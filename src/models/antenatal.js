import mongoose from "mongoose";

const antenatalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodPressure: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    bloodLevel: {
      type: Number,
      required: true,
    },
    prescribedDrugs: {
      type: String,
      required: true,
    },
    drugsToAvoid: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    aiFeedback: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Antenatal", antenatalSchema);
