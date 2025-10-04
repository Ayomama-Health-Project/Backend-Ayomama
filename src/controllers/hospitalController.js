import opencage from "opencage-api-client";
import axios from "axios";

export const getNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Missing coordinates",
      });
    }

    // Reverse geocode the user's location (optional, just to show where user is)
    const userGeo = await opencage.geocode({
      q: `${latitude},${longitude}`,
      key: process.env.OPENCAGE_API_KEY,
    });

    const userAddress = userGeo?.results?.[0]?.formatted || "Unknown location";

    // Query Overpass for nearby hospitals
    const overpassQuery = `
      [out:json];
      node["amenity"="hospital"](around:${radius},${latitude},${longitude});
      out;
    `;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;
    const response = await axios.get(overpassUrl);

    let hospitals = await Promise.all(
      response.data.elements.map(async (e) => {
        let formattedAddress = "Address not available";

        try {
          const geoRes = await opencage.geocode({
            q: `${e.lat},${e.lon}`,
            key: process.env.OPENCAGE_API_KEY,
          });
          formattedAddress =
            geoRes?.results?.[0]?.formatted || formattedAddress;
        } catch (geoErr) {
          console.error(`Failed to geocode hospital ${e.id}`, geoErr.message);
        }

        return {
          id: e.id,
          name: e.tags?.name || "Unnamed Hospital",
          lat: e.lat,
          lon: e.lon,
          address: formattedAddress,
          // phone: e.tags?.phone || "Phone not available",
          // website: e.tags?.website || "Website not available",
          tags: e.tags || {},
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Nearby hospitals fetched successfully",
      userLocation: userAddress,
      data: hospitals,
    });
  } catch (err) {
    console.error("Hospital error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// import opencage from "opencage-api-client";
// import axios from "axios";

// export const getNearbyHospitals = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { latitude, longitude, radius = 2000 } = req.body;

//     if (!latitude || !longitude) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing coordinates",
//       });
//     }

//     // 1. Reverse geocode with OpenCage
//     const geo = await opencage.geocode({
//       q: `${latitude},${longitude}`,
//       key: process.env.OPENCAGE_API_KEY,
//     });

//     const address = geo?.results?.[0]?.formatted || "Unknown location";

//     // 2. Query Overpass API for nearby hospitals
//     const overpassQuery = `
//       [out:json];
//       node["amenity"="hospital"](around:${radius},${latitude},${longitude});
//       out;
//     `;

//     const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
//       overpassQuery
//     )}`;

//     const response = await axios.get(overpassUrl);
//     const data = response.data;

//     console.log("data:", data);

//     const hospitals = data.elements.map((e) => ({
//       id: e.id,
//       name: e.tags?.name || "Unnamed Hospital",
//       lat: e.lat,
//       lon: e.lon,
//       address: e.tags?.["addr:full"] || "Address not available",
//       phone: e.tags?.phone || "Phone not available",
//       website: e.tags?.website || "Website not available",
//       tags: e.tags || {},
//     }));

//     res.status(200).json({
//       success: true,
//       message: "Nearby hospitals fetched successfully",
//       data: hospitals,
//     });
//   } catch (err) {
//     console.error("Hospital error:", err);
//     if (!res.headersSent) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// };
