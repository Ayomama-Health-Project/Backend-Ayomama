import Visit from "../models/Visit.js";

// 📅 Schedule a visit
export const visitSchedule = async (req, res) => {
  try {
    const { visitDate, visitTime, duration, hospitalName, doctorName, notes } =
      req.body;
    const userId = req.user._id;

    // Check required fields
    if (!visitDate || !visitTime) {
      return res
        .status(400)
        .json({ error: "Visit date and time are required." });
    }

    // Convert visitTime safely
    let reminderDateTime;
    if (typeof visitTime === "string" && visitTime.includes(":")) {
      // e.g. "14:30"
      reminderDateTime = new Date(`${visitDate}T${visitTime}`);
    } else if (typeof visitTime === "number") {
      // Interpret as hours offset from start of day (optional design)
      const dateObj = new Date(visitDate);
      dateObj.setHours(visitTime, 0, 0, 0);
      reminderDateTime = dateObj;
    } else {
      throw new Error(
        "Invalid visitTime format. Use 'HH:mm' or a number (hours)."
      );
    }

    // Parse duration correctly (strip non-digits)
    const numericDuration =
      typeof duration === "string" ? parseInt(duration) : Number(duration) || 0;

    const visit = await Visit.create({
      userId,
      reminderDateTime,
      duration: numericDuration,
      hospitalName,
      doctorName,
      notes,
    });

    res.status(201).json({ message: "Visit successfully scheduled 💛", visit });
  } catch (err) {
    console.error("Visit schedule error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all visits for a user
export const getVisits = async (req, res) => {
  try {
    const userId = req.user._id;
    const visits = await Visit.find({ userId }).sort({ reminderDateTime: 1 });
    res.status(200).json({ visits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get a specific visit by ID
export const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const visit = await Visit.findOne({ _id: id, userId });
    if (!visit) {
      return res.status(404).json({ error: "Visit not found." });
    }

    res.status(200).json({ visit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update a specific visit
export const updateSpecificVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { visitDate, visitTime, duration, hospitalName, doctorName, notes } =
      req.body;

    let reminderDateTime;

    // ✅ Safely construct reminderDateTime
    if (visitDate && visitTime) {
      if (typeof visitTime === "string" && visitTime.includes(":")) {
        // Example: "14:30"
        reminderDateTime = new Date(`${visitDate}T${visitTime}`);
      } else if (typeof visitTime === "number") {
        // Example: 9 (for 9 AM)
        const dateObj = new Date(visitDate);
        dateObj.setHours(visitTime, 0, 0, 0);
        reminderDateTime = dateObj;
      } else {
        throw new Error(
          "Invalid visitTime format. Use 'HH:mm' or a number (hours)."
        );
      }

      if (isNaN(reminderDateTime.getTime())) {
        throw new Error("Invalid visitDate or visitTime provided.");
      }
    }

    // ✅ Safely parse duration
    const numericDuration =
      typeof duration === "string" ? parseInt(duration) : Number(duration) || 0;

    // ✅ Build update object dynamically
    const updateFields = {
      duration: numericDuration,
      hospitalName,
      doctorName,
      notes,
    };

    if (reminderDateTime) updateFields.reminderDateTime = reminderDateTime;

    // ✅ Perform update
    const visit = await Visit.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!visit) {
      return res.status(404).json({ error: "Visit not found." });
    }

    res.status(200).json({ message: "Visit updated successfully 💛", visit });
  } catch (err) {
    console.error("Visit update error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete a specific visit
export const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const visit = await Visit.findOneAndDelete({ _id: id, userId });
    if (!visit) {
      return res.status(404).json({ error: "No visit scheduled." });
    }

    res.status(200).json({ message: "Visit deleted successfully 💛" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
