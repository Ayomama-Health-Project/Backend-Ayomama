import express from 'express'
import {loginUser, signUp} from '../controllers/authController.js';


const router = express.Router()

router.post("/register", signUp);
router.post("/login", loginUser);


export default router