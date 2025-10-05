import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { sendOTPEmail } from "../utils/email.js";

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// === Sign Up ===
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ error: "name, email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("signUp error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// === Login ===
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches)
      return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = generateToken({ userId: user._id });
    res.cookie("token", accessToken, COOKIE_OPTIONS);

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: accessToken,
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// const getProfile = async (req, res) => {
//   try {
//     if (!req.user) return res.status(401).json({ error: "Unauthorized" });

//     // Support tokens that contain userId or id
//     const id = req.user._id;

//     const user = await User.findById(id).select("-password");
//     console.log(user);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const logoutUser = async (_req, res) => {
  try {
    // clear cookie (must match options like path/sameSite/secure)
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
