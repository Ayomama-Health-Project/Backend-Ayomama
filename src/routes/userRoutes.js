import {
  updateLanguagePreference,
  profileInformation,
  getUser,
} from "../controllers/userController.js";
import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectRoute, getUser);
router.put("/update-language", protectRoute, updateLanguagePreference);
router.put("/profile-info", protectRoute, profileInformation);

export default router;
