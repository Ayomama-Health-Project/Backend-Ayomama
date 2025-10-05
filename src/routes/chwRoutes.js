import express from "express"
import {signUpCHW, loginCHW} from '../controllers/chwController.js'


const router = express.Router()

router.post("/register_chw", signUpCHW);
router.post("/login_chw", loginCHW);

export default router