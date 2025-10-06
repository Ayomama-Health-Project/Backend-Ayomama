import express from "express";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import hospitalRoutes from "./routes/hospitalRoute.js";
import chwRoutes from "./routes/chwRoutes.js"
import patientRoutes from "./routes/patientRoutes.js"


import "./jobs/reminderJobs.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reminder", reminderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/hospitals", hospitalRoutes);

// Routes for CHW(Community Health Workers)
app.use("/api/auth_chw", chwRoutes)
app.use("/api/patient", patientRoutes)


app.get("/", (req, res) => {
  res.send({ message: "This is ayomama backend" });
});

app.listen(port, (req, res) => {
  console.log(`server running on {http://localhost:3000}`);
});


