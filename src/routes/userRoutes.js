import {
  updateLanguagePreference,
  profileInformation,
  getUser,
  getUserEmergencyContact,
  getPostPartumUser,
  postPartumProfileInfo,
  babyAge,
  babyBirthInfo,
  babyNickname
} from "../controllers/userController.js";
import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Pregnant Mothers Routes
router.get("/pregnant-user", protectRoute, getUser);
router.put("/update-language", protectRoute, updateLanguagePreference);
router.put("/profile-info", protectRoute, profileInformation);
router.get("/emergency-contact", protectRoute, getUserEmergencyContact);

// Post Partum Mothers Routes 
router.get("/post-partum-mother", protectRoute, getPostPartumUser)
router.patch("/post-partum-profile", protectRoute, postPartumProfileInfo)
router.patch("/baby-age", protectRoute, babyAge)
router.patch("/baby-info", protectRoute, babyBirthInfo)
router.patch("/baby-nickname", protectRoute, babyNickname)


export default router;
