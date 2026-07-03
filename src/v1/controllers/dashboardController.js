import MotherProfile from "../../models/MotherProfile.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import BlogPost from "../../models/BlogPost.js";
import Appointment from "../../models/Appointment.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { buildMotherContext, getLinkedMotherAccountId } from "../utils/motherContext.js";

import HealthWorkerProfile from "../../models/healthWorkerProfile.js";


function getDisplayName(account, profile) {
  if (profile?.fullName) return profile.fullName;
  return account.email.split("@")[0];
}

export async function getDashboardSummary(req, res) {
  const targetMotherAccountId = await getLinkedMotherAccountId(req.account);
  if (!targetMotherAccountId) {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Mother context unavailable",
      status: 403,
      detail: "This account does not have access to a mother dashboard summary.",
      errors: [{ field: "role", code: "mother_context_unavailable" }],
    });
  }

  const [motherProfile, partnerProfile, context, nextAppointment, blogs] = await Promise.all([
    MotherProfile.findOne({ account: targetMotherAccountId }).lean(),
    PartnerProfile.findOne({ linkedMotherAccount: targetMotherAccountId }).lean(),
    buildMotherContext(req.account),
    Appointment.findOne({
      ownerMotherAccount: targetMotherAccountId,
      status: "scheduled",
      scheduledFor: { $gte: new Date() },
    })
      .sort({ scheduledFor: 1 })
      .lean(),
    BlogPost.find({ status: "published" }).sort({ publishedAt: -1 }).limit(3).lean(),
  ]);

  return sendSuccess(res, {
    message: "Dashboard summary loaded successfully.",
    data: {
      viewerRole: req.account.role,
      mother: {
        fullName: getDisplayName(req.account, motherProfile),
        motherType: context?.motherType || (req.account.role === "mother" ? req.account.motherType : "pregnant"),
        dueDate: motherProfile?.dueDate || null,
        babyBirthDate: motherProfile?.babyBirthDate || null,
        babyBirthHospital: motherProfile?.babyBirthHospital || "",
        linkedPartner: partnerProfile
          ? {
              fullName: partnerProfile.fullName,
              relationshipLabel: partnerProfile.relationshipLabel,
            }
          : null,
      },
      summary: context,
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment._id,
            serviceType: nextAppointment.serviceType,
            hospitalName: nextAppointment.hospitalName,
            healthcareProvider: nextAppointment.healthcareProvider,
            scheduledFor: nextAppointment.scheduledFor,
            durationMinutes: nextAppointment.durationMinutes,
            notes: nextAppointment.notes,
          }
        : null,
      publishedBlogs: blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category,
        coverImage: blog.coverImage,
        publishedAt: blog.publishedAt,
      })),
    },
  });
}

export async function toggleChecklistItem(req, res) {
  const motherAccountId = await getLinkedMotherAccountId(req.account);
  if (!motherAccountId || req.account.role !== "mother") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only mothers can update checklist items.",
      errors: [{ field: "role", code: "mother_only" }],
    });
  }

  const profile = await MotherProfile.findOne({ account: motherAccountId });
  if (!profile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Profile not found",
      status: 404,
      detail: "Mother profile could not be found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const item = profile.checklistItems.find((entry) => entry.itemId === req.params.itemId);
  if (!item) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Checklist item not found",
      status: 404,
      detail: "This checklist item does not exist.",
      errors: [{ field: "itemId", code: "not_found" }],
    });
  }

  item.completed = !item.completed;
  profile.checklistLastResetAt = new Date();
  await profile.save();

  return sendSuccess(res, {
    message: "Checklist item updated successfully.",
    data: { itemId: item.itemId, completed: item.completed },
  });
}

export async function updateDashboardState(req, res) {
  const motherAccountId = await getLinkedMotherAccountId(req.account);
  if (!motherAccountId || req.account.role !== "mother") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only mothers can update dashboard data.",
      errors: [{ field: "role", code: "mother_only" }],
    });
  }

  const profile = await MotherProfile.findOne({ account: motherAccountId });
  if (!profile) {
    return sendProblem(res, req, {
      type: "/problems/not-found",
      title: "Profile not found",
      status: 404,
      detail: "Mother profile could not be found.",
      errors: [{ field: "account", code: "not_found" }],
    });
  }

  const payload = req.body || {};

  if (typeof payload.dueDate !== "undefined") {
    profile.dueDate = payload.dueDate || null;
  }
  if (typeof payload.babyName !== "undefined") {
    profile.babyName = payload.babyName || "";
    if (!profile.babyNickname) {
      profile.babyNickname = payload.babyName || "";
    }
  }
  if (Array.isArray(payload.medicationReminders)) {
    profile.medicationReminders = payload.medicationReminders;
  }
  if (payload.vitalsOverview) {
    profile.vitalsOverview = {
      ...profile.vitalsOverview?.toObject?.(),
      ...payload.vitalsOverview,
      updatedAt: new Date(),
    };
  }
  if (Array.isArray(payload.nutritionPlan)) {
    profile.nutritionPlan = payload.nutritionPlan;
  }
  if (Array.isArray(payload.journalEntries)) {
    profile.journalEntries = payload.journalEntries;
  }
  if (Array.isArray(payload.emergencyContacts)) {
    profile.emergencyContacts = payload.emergencyContacts;
  }
  if (Array.isArray(payload.wellnessActivities)) {
    profile.wellnessActivities = payload.wellnessActivities;
  }
  if (Array.isArray(payload.checklistItems)) {
    profile.checklistItems = payload.checklistItems;
    profile.checklistLastResetAt = new Date();
  }

  await profile.save();
  const context = await buildMotherContext(req.account);

  return sendSuccess(res, {
    message: "Dashboard data updated successfully.",
    data: context,
  });
}

// ================================ DashBoard Controller for Health Workers ================================

// export async function getHealthWorkerDashboard(req, res) {
//   const healthWorkerAccountId = req.account._id;
//   const healthWorkerProfile = await HealthWorkerProfile.findOne({ account: healthWorkerAccountId }).lean();

//   if (!healthWorkerProfile) {
//     return sendProblem(res, req, {
//       type: "/problems/not-found",
//       title: "Health worker profile not found",
//       status: 404,
//       detail: "The health worker profile for the current account was not found.",
//       errors: [{ field: "account", code: "health_worker_profile_not_found" }],
//     });
//   }



//   return sendSuccess(res, {
//     message: "Health worker dashboard loaded successfully.",
//     data: {...healthWorkerProfile },
//   });
// }
