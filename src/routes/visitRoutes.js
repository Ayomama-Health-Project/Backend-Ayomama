import {
  visitSchedule,
  getVisits,
  getVisitById,
  updateSpecificVisit,
  deleteVisit,
} from "../controllers/visitController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/create_schedule", protectRoute, visitSchedule);
router.get("/get_visits", protectRoute, getVisits);
router.get("/get_visit/:id", protectRoute, getVisitById);
router.put("/update_visit/:id", protectRoute, updateSpecificVisit);
router.delete("/delete_visit/:id", protectRoute, deleteVisit);

export default router;













export async function protectCHW(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: You must be logged in to access this route",
        success: false,
      });
    }

    let decoded;
    try {
      decoded = decodeToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Token invalid or expired", success: false });
    }

    const chw = await CHW.findById(decoded.userId).select("-password");
    if (!chw) {
      return res.status(401).json({ message: "CHW not found", success: false });
    }

    req.user = chw;
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}
