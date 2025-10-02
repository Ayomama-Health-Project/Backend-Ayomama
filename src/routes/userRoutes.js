import {updateLanguagePreference, profileInformation} from '../controllers/userController.js'
import express from 'express'
import {authMiddleware} from '../middleware/authMiddleware.js'

const router = express.Router();

router.put("/update_language", authMiddleware, updateLanguagePreference);
router.put("/profile_info", authMiddleware, profileInformation);

export default router;