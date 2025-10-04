import opencage from "opencage-api-client";
import axios from "axios";

export const getNearbyHospitals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { latitude, longitude, radius = 20000 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
      });
    }
  } catch (err) {
    console.error("Hospital error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};
