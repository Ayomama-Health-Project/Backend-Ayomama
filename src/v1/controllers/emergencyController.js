import axios from "axios";
import { sendProblem, sendSuccess } from "../../utils/problem.js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function listNearbyHospitals(req, res) {
  const { latitude, longitude } = req.validated.query;

  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"hospital|clinic"](around:5000,${latitude},${longitude});
        way["amenity"~"hospital|clinic"](around:5000,${latitude},${longitude});
        relation["amenity"~"hospital|clinic"](around:5000,${latitude},${longitude});
      );
      out center tags;
    `;

    const response = await axios.post(OVERPASS_URL, overpassQuery, {
      headers: {
        "Content-Type": "text/plain",
      },
      timeout: 20000,
    });

    const items = (response.data?.elements || []).map((entry) => {
      const lat = entry.lat ?? entry.center?.lat;
      const lng = entry.lon ?? entry.center?.lon;
      const distanceKm = Math.sqrt(
        (lat - latitude) ** 2 + (lng - longitude) ** 2,
      ) * 111;

      return {
        id: `${entry.type}-${entry.id}`,
        name: entry.tags?.name || "Nearby Hospital",
        address:
          [
            entry.tags?.["addr:housenumber"],
            entry.tags?.["addr:street"],
            entry.tags?.["addr:city"],
          ]
            .filter(Boolean)
            .join(" ") || "Address unavailable",
        latitude: lat,
        longitude: lng,
        phone: entry.tags?.phone || entry.tags?.["contact:phone"] || "",
        distanceKm: Number(distanceKm.toFixed(2)),
        category: entry.tags?.amenity || "hospital",
      };
    });

    items.sort((a, b) => a.distanceKm - b.distanceKm);

    return sendSuccess(res, {
      message: "Nearby hospitals loaded successfully.",
      data: items.slice(0, 10),
    });
  } catch (error) {
    return sendProblem(res, req, {
      type: "/problems/server-error",
      title: "Hospital lookup failed",
      status: 502,
      detail: "Nearby hospitals could not be loaded right now.",
      errors: [{ field: "location", code: "lookup_failed", message: error.message }],
    });
  }
}
