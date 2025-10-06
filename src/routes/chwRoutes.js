import express from "express"
import {signUpCHW, loginCHW ,chwProfile, assignPatient, currentUserCHW} from '../controllers/chwController.js'
import {protectRoute} from "../middleware/authMiddleware.js"


const router = express.Router()

router.post("/register_chw", signUpCHW);
router.post("/login_chw", loginCHW);
router.get("/current_chw", currentUserCHW)
router.put("/chw_profile", chwProfile);
router.post("/assign_patient", protectRoute, assignPatient);

export default router