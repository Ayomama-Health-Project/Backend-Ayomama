import {
  updateLanguagePreference,
  profileInformation,
} from "../controllers/userController.js";
import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/update_language", protectRoute, updateLanguagePreference);
router.put("/profile_info", protectRoute, profileInformation);

export default router;
