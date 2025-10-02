import express from 'express'
import {loginUser, signUp, getProfile} from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js'



const router = express.Router()

router.post("/register", signUp);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getProfile)

export default router