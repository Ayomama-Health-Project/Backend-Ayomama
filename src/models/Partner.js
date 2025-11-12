import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: String,
  linkedPatient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // links to mother
});

export default mongoose.model("Partner", partnerSchema);
