import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    fullName: { type: String, default: "" },
    adminRole: {
      type: String,
      enum: ["admin", "super_admin"],
      required: true,
    },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.AdminProfile || mongoose.model("AdminProfile", adminProfileSchema);
