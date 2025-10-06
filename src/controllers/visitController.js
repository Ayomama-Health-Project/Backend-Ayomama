import Visit from "../models/Visit.js";

// 📅 Schedule a visit
export const visitSchedule = async (req, res) => {
  try {
    const { visitDate, visitTime, duration, hospitalName, doctorName, notes } =
      req.body;
    const userId = req.user._id;

    if (!visitDate || !visitTime) {
      return res
        .status(400)
        .json({ error: "Visit date and time are required." });
    }

    const reminderDateTime = new Date(`${visitDate}T${visitTime}`);

    const visit = await Visit.create({
      userId,
      reminderDateTime,
      duration,
      hospitalName,
      doctorName,
      notes,
    });

    res.status(201).json({ message: "Visit successfully scheduled 💛", visit });
  } catch (err) {
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

    const reminderDateTime = new Date(`${visitDate}T${visitTime}`);

    const visit = await Visit.findOneAndUpdate(
      { _id: id, userId },
      { reminderDateTime, duration, hospitalName, doctorName, notes },
      { new: true, runValidators: true }
    );

    if (!visit) {
      return res.status(404).json({ error: "Visit not found." });
    }

    res.status(200).json({ message: "Visit updated successfully 💛", visit });
  } catch (err) {
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
