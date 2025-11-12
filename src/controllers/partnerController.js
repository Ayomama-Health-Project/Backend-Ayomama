// src/controllers/partnerController.js
import PartnerInvite from "../models/PartnerInvite.js";
import Partner from "../models/Partner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";


export const createInvite = async (req, res) => {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    const { invitedEmail } = req.body;

    const invite = await PartnerInvite.create({
      patient: req.user._id,
      invitedEmail,
      token,
    });

    const inviteLink = `https://backend-ayomama.onrender.com/partner?token=${token}`;
    // const inviteLink = `https://ayomama.vercel.app/partner-invite?token=${token}`;
    res.status(201).json({ inviteLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating invite" });
  }
};

// Verify Invite
export const verifyInvite = async (req, res) => {
  try {
    const { token } = req.query;
    const invite = await PartnerInvite.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    }).populate("patient", "user_name email");

    if (!invite) return res.status(400).json({ valid: false, message: "Invalid or expired link" });

    res.status(200).json({
      valid: true,
      patientName: invite.patient.user_name,
      patientEmail: invite.patient.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Error verifying invite" });
  }
};

//  Signing up Partner in our database
export const partnerSignup = async (req, res) => {
  try {
    const { name, email, password, token } = req.body;

    const invite = await PartnerInvite.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) return res.status(400).json({ error: "Invalid or expired invite" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const partner = await Partner.create({
      name,
      email,
      password: hashedPassword,
      linkedPatient: invite.patient,
    });

    invite.used = true;
    await invite.save();

    const jwtToken = jwt.sign(
      { partnerId: partner._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Partner registered and linked successfully",
      token: jwtToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating partner" });
  }
};
