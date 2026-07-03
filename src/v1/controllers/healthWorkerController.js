import Patient from "../../models/patient.js";
import HealthLog from "../../models/healthlogs.js";
import CHWVisit from "../../models/chwVisit.js";
import Visit from "../../models/Visit.js";
import Appointment from "../../models/Appointment.js";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { sendPushNotificationToAccounts } from "../../utils/pushNotifications.js";

export async function createPatient(req, res) {
  const hwProfile = await HealthWorkerProfile.findOne({ account: req.account._id });
  if (!hwProfile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Health worker profile not found",
      status: 404,
      detail: "Health worker profile for the current account was not found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const payload = req.body || {};
  if (!payload.name || !payload.contact) {
    return sendProblem(res, req, {
      type: "/problems/invalid-request",
      title: "Invalid payload",
      status: 400,
      detail: "Missing required fields: name or contact.",
      errors: [],
    });
  }

  const patient = await Patient.create({
    name: payload.name,
    pregnancyStage: payload.pregnancyStage || "",
    patientVisitDate: payload.patientVisitDate || new Date(),
    antinentalVisitDate: payload.antinentalVisitDate || null,
    contact: payload.contact,
    linkedHealthWorker: hwProfile._id,
  });

  return sendSuccess(res, {
    status: 201,
    message: "Patient created successfully.",
    data: { id: patient._id, name: patient.name },
  });
}

export async function addHealthLog(req, res) {
  const hwProfile = await HealthWorkerProfile.findOne({ account: req.account._id });
  if (!hwProfile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Health worker profile not found",
      status: 404,
      detail: "Health worker profile for the current account was not found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Patient not found",
      status: 404,
      detail: "The requested patient does not exist.",
      errors: [{ field: "patientId", code: "not_found" }],
    });
  }

  const body = req.body || {};
  const allowedRisk = ["safe", "monitor", "urgent"];
  if (body.riskStatus && !allowedRisk.includes(body.riskStatus)) {
    return sendProblem(res, req, {
      type: "/problems/invalid-request",
      title: "Invalid riskStatus",
      status: 422,
      detail: `riskStatus must be one of: ${allowedRisk.join(", ")}`,
      errors: [{ field: "riskStatus", code: "invalid_enum" }],
    });
  }
  const healthLog = await HealthLog.create({
    patientId: patient._id,
    pregnancyStage: body.pregnancyStage || patient.pregnancyStage || "",
    visitDate: body.visitDate || new Date(),
    riskStatus: body.riskStatus || "safe",
    medicalHistory: body.medicalHistory || "",
    patientInformation: {
      temperature: body.temperature || null,
      weight: body.weight || null,
      bloodLevel: body.bloodLevel || null,
      bloodPressure: body.bloodPressure || "",
    },
  });

  // attach to patient
  patient.healthLogs = patient.healthLogs || [];
  patient.healthLogs.push(healthLog._id);
  await patient.save();

  return sendSuccess(res, {
    status: 201,
    message: "Health log added successfully.",
    data: { id: healthLog._id },
  });
}

export async function logCHWVisit(req, res) {
  const hwProfile = await HealthWorkerProfile.findOne({ account: req.account._id });
  if (!hwProfile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Health worker profile not found",
      status: 404,
      detail: "Health worker profile for the current account was not found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const patient = await Patient.findById(req.params.patientId);
  if (!patient) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Patient not found",
      status: 404,
      detail: "The requested patient does not exist.",
      errors: [{ field: "patientId", code: "not_found" }],
    });
  }

  const body = req.body || {};
  const visit = await CHWVisit.create({
    chwId: hwProfile._id,
    patientId: patient._id,
    visitDate: body.visitDate || new Date(),
    antinentalVisitDate: body.antinentalVisitDate || null,
    contact: body.contact || patient.contact || "",
  });

  patient.visits = patient.visits || [];
  patient.visits.push(visit._id);
  await patient.save();

  // Create an Appointment entry so it appears in scheduled appointments
  const appt = await Appointment.create({
    account: req.account._id,
    ownerMotherAccount: req.account._id,
    serviceType: "CHW Visit",
    hospitalName: hwProfile.facilityName || "",
    healthcareProvider: hwProfile.fullName || "",
    scheduledFor: body.visitDate || new Date(),
    durationMinutes: body.durationMinutes || 30,
    notes: body.notes || `CHW visit logged for patient ${patient.name}`,
  });

  // Send push notification to the health worker account (and any others if desired)
  try {
    await sendPushNotificationToAccounts([req.account._id], {
      title: "Visit logged",
      body: `Visit for ${patient.name} logged for ${new Date(visit.visitDate).toLocaleString()}`,
      data: { type: "chw_visit_logged", visitId: visit._id.toString(), appointmentId: appt._id.toString() },
    });
  } catch (e) {
    // ignore notification errors
  }

  return sendSuccess(res, {
    status: 201,
    message: "CHW visit logged successfully.",
    data: { id: visit._id },
  });
}

export async function getUpcomingVisits(req, res) {
  const hwProfile = await HealthWorkerProfile.findOne({ account: req.account._id });
  if (!hwProfile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Health worker profile not found",
      status: 404,
      detail: "Health worker profile for the current account was not found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const patients = await Patient.find({ linkedHealthWorker: hwProfile._id }).select("_id name").lean();
  const patientIds = patients.map((p) => p._id);

  const now = new Date();
  const visits = await Visit.find({ linkedPatient: { $in: patientIds }, reminderDateTime: { $gte: now } })
    .sort({ reminderDateTime: 1 })
    .lean();

  // Include Appointment-type scheduled visits that were created by this health worker
  const appts = await Appointment.find({ ownerMotherAccount: req.account._id, scheduledFor: { $gte: now }, status: "scheduled" })
    .sort({ scheduledFor: 1 })
    .lean();

  // Normalize and merge
  const normalizedVisits = [
    ...visits.map((v) => ({
      id: v._id,
      type: "visit",
      date: v.reminderDateTime,
      title: v.doctorName,
      duration: v.duration,
      hospitalName: v.hospitalName,
      linkedPatient: v.linkedPatient,
    })),
    ...appts.map((a) => ({
      id: a._id,
      type: "appointment",
      date: a.scheduledFor,
      title: a.serviceType,
      duration: a.durationMinutes,
      hospitalName: a.hospitalName,
      linkedPatient: null,
    })),
  ];

  normalizedVisits.sort((x, y) => new Date(x.date) - new Date(y.date));

  const top3 = normalizedVisits.slice(0, 3);

  return sendSuccess(res, {
    message: "Upcoming visits loaded.",
    data: top3,
  });
}

export default {}
