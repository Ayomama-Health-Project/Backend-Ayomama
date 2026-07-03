import Appointment from "../../models/Appointment.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { sendPushNotificationToAccounts } from "../../utils/pushNotifications.js";
import { getLinkedMotherAccountId } from "../utils/motherContext.js";

export async function listVisits(req, res) {
  const motherAccountId = await getLinkedMotherAccountId(req.account);
  if (!motherAccountId) {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Visits unavailable",
      status: 403,
      detail: "This account does not have access to visit data.",
      errors: [{ field: "role", code: "visit_context_unavailable" }],
    });
  }

  const visits = await Appointment.find({ ownerMotherAccount: motherAccountId })
    .sort({ scheduledFor: 1 })
    .lean();

  return sendSuccess(res, {
    message: "Visits loaded successfully.",
    data: visits.map((visit) => ({
      id: visit._id,
      serviceType: visit.serviceType,
      hospitalName: visit.hospitalName,
      healthcareProvider: visit.healthcareProvider,
      scheduledFor: visit.scheduledFor,
      durationMinutes: visit.durationMinutes,
      notes: visit.notes,
      checklist: visit.checklist,
      status: visit.status,
    })),
  });
}

export async function createVisit(req, res) {
  const motherAccountId = await getLinkedMotherAccountId(req.account);
  if (!motherAccountId || req.account.role !== "mother") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only mothers can create visits.",
      errors: [{ field: "role", code: "mother_only" }],
    });
  }

  const visit = await Appointment.create({
    account: req.account._id,
    ownerMotherAccount: motherAccountId,
    serviceType: req.validated.body.serviceType,
    hospitalName: req.validated.body.hospitalName,
    healthcareProvider: req.validated.body.healthcareProvider,
    scheduledFor: req.validated.body.scheduledFor,
    durationMinutes: req.validated.body.durationMinutes,
    notes: req.validated.body.notes || "",
    checklist: req.validated.body.checklist || [],
  });

  const linkedPartner = await PartnerProfile.findOne({
    linkedMotherAccount: motherAccountId,
  }).lean();

  await sendPushNotificationToAccounts(
    [motherAccountId, linkedPartner?.account],
    {
      title: "Visit reminder updated",
      body: `${visit.serviceType} has been scheduled for ${new Date(visit.scheduledFor).toLocaleString()}.`,
      data: {
        type: "visit_created",
        visitId: visit._id.toString(),
      },
    },
  );

  return sendSuccess(res, {
    status: 201,
    message: "Visit created successfully.",
    data: {
      id: visit._id,
      serviceType: visit.serviceType,
      hospitalName: visit.hospitalName,
      healthcareProvider: visit.healthcareProvider,
      scheduledFor: visit.scheduledFor,
      durationMinutes: visit.durationMinutes,
      notes: visit.notes,
      checklist: visit.checklist,
      status: visit.status,
    },
  });
}

export async function updateVisit(req, res) {
  const motherAccountId = await getLinkedMotherAccountId(req.account);
  if (!motherAccountId || req.account.role !== "mother") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only mothers can update visits.",
      errors: [{ field: "role", code: "mother_only" }],
    });
  }

  const visit = await Appointment.findOne({
    _id: req.params.visitId,
    ownerMotherAccount: motherAccountId,
  });

  if (!visit) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Visit not found",
      status: 404,
      detail: "The visit you are trying to update does not exist.",
      errors: [{ field: "visitId", code: "not_found" }],
    });
  }

  visit.serviceType = req.validated.body.serviceType;
  visit.hospitalName = req.validated.body.hospitalName;
  visit.healthcareProvider = req.validated.body.healthcareProvider;
  visit.scheduledFor = req.validated.body.scheduledFor;
  visit.durationMinutes = req.validated.body.durationMinutes;
  visit.notes = req.validated.body.notes || "";
  visit.checklist = req.validated.body.checklist || [];
  await visit.save();

  const linkedPartner = await PartnerProfile.findOne({
    linkedMotherAccount: motherAccountId,
  }).lean();

  await sendPushNotificationToAccounts(
    [motherAccountId, linkedPartner?.account],
    {
      title: "Visit reminder updated",
      body: `${visit.serviceType} is now set for ${new Date(visit.scheduledFor).toLocaleString()}.`,
      data: {
        type: "visit_updated",
        visitId: visit._id.toString(),
      },
    },
  );

  return sendSuccess(res, {
    message: "Visit updated successfully.",
    data: {
      id: visit._id,
      serviceType: visit.serviceType,
      hospitalName: visit.hospitalName,
      healthcareProvider: visit.healthcareProvider,
      scheduledFor: visit.scheduledFor,
      durationMinutes: visit.durationMinutes,
      notes: visit.notes,
      checklist: visit.checklist,
      status: visit.status,
    },
  });
}
