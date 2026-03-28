import bcrypt from "bcryptjs";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import MotherProfile from "../../models/MotherProfile.js";
import NotificationToken from "../../models/NotificationToken.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { serializeAccount } from "../utils/profileResolver.js";

export async function patchProfile(req, res) {
  const payload = req.validated.body;
  const account = req.account;

  if (payload.profilePicture) {
    account.profilePicture = payload.profilePicture;
  }

  if (typeof payload.fullName !== "undefined" && ["admin", "super_admin"].includes(account.role)) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Use the admin profile endpoints to update admin profiles.",
      errors: [{ field: "role", code: "admin_profile_update_forbidden" }],
    });
  }

  switch (account.role) {
    case "mother":
      await MotherProfile.findOneAndUpdate(
        { account: account._id },
        {
          ...(typeof payload.fullName !== "undefined" ? { fullName: payload.fullName } : {}),
          ...(typeof payload.phoneNumber !== "undefined" ? { phoneNumber: payload.phoneNumber } : {}),
          ...(typeof payload.address !== "undefined" ? { address: payload.address } : {}),
          ...(typeof payload.emergencyContacts !== "undefined" ? { emergencyContacts: payload.emergencyContacts } : {}),
          ...(typeof payload.dueDate !== "undefined" ? { dueDate: payload.dueDate || null } : {}),
          ...(typeof payload.lastPeriodDate !== "undefined" ? { lastPeriodDate: payload.lastPeriodDate || null } : {}),
          ...(typeof payload.babyName !== "undefined" ? { babyName: payload.babyName } : {}),
          ...(typeof payload.babyNickname !== "undefined" ? { babyNickname: payload.babyNickname } : {}),
          ...(typeof payload.babyBirthDate !== "undefined" ? { babyBirthDate: payload.babyBirthDate || null } : {}),
          ...(typeof payload.babyBirthWeight !== "undefined" ? { babyBirthWeight: payload.babyBirthWeight } : {}),
          ...(typeof payload.babyBirthHospital !== "undefined" ? { babyBirthHospital: payload.babyBirthHospital } : {}),
          ...(typeof payload.healthConcerns !== "undefined" ? { healthConcerns: payload.healthConcerns } : {}),
          ...(typeof payload.pregnancyWeek !== "undefined" ? { pregnancyWeek: payload.pregnancyWeek } : {}),
        },
      );
      break;
    case "partner":
      await PartnerProfile.findOneAndUpdate(
        { account: account._id },
        {
          ...(typeof payload.fullName !== "undefined" ? { fullName: payload.fullName } : {}),
          ...(typeof payload.phoneNumber !== "undefined" ? { phoneNumber: payload.phoneNumber } : {}),
          ...(typeof payload.relationshipLabel !== "undefined" ? { relationshipLabel: payload.relationshipLabel } : {}),
        },
      );
      break;
    case "health_worker":
      await HealthWorkerProfile.findOneAndUpdate(
        { account: account._id },
        {
          ...(typeof payload.fullName !== "undefined" ? { fullName: payload.fullName } : {}),
          ...(typeof payload.phoneNumber !== "undefined" ? { phoneNumber: payload.phoneNumber } : {}),
          ...(typeof payload.state !== "undefined" ? { state: payload.state } : {}),
          ...(typeof payload.localGovernment !== "undefined" ? { localGovernment: payload.localGovernment } : {}),
          ...(typeof payload.occupation !== "undefined" ? { occupation: payload.occupation } : {}),
          ...(typeof payload.facilityName !== "undefined" ? { facilityName: payload.facilityName } : {}),
          ...(typeof payload.facilityCode !== "undefined" ? { facilityCode: payload.facilityCode } : {}),
        },
      );
      break;
    default:
      break;
  }

  await account.save();

  return sendSuccess(res, {
    message: "Profile updated successfully.",
    data: await serializeAccount(account),
  });
}

export async function patchLanguage(req, res) {
  req.account.language = req.validated.body.language;
  await req.account.save();

  return sendSuccess(res, {
    message: "Language updated successfully.",
    data: await serializeAccount(req.account),
  });
}

export async function patchOnboarding(req, res) {
  const {
    onboardingCompleted,
    quickSetupSelections,
    supportCircle,
    currentStep,
    flow,
    draft,
  } = req.validated.body;
  req.account.onboardingCompleted = onboardingCompleted;
  req.account.status = onboardingCompleted ? "active" : "pending_onboarding";
  req.account.onboardingProgress = onboardingCompleted
    ? {
        flow: "",
        currentStep: 0,
        draft: {},
        updatedAt: new Date(),
      }
    : {
        flow: typeof flow !== "undefined" ? flow : req.account.onboardingProgress?.flow || "",
        currentStep:
          typeof currentStep !== "undefined"
            ? currentStep
            : req.account.onboardingProgress?.currentStep || 0,
        draft:
          typeof draft !== "undefined"
            ? draft
            : req.account.onboardingProgress?.draft || {},
        updatedAt: new Date(),
      };
  await req.account.save();

  if (req.account.role === "mother") {
    await MotherProfile.findOneAndUpdate(
      { account: req.account._id },
      {
        ...(typeof quickSetupSelections !== "undefined" ? { quickSetupSelections } : {}),
        ...(typeof supportCircle !== "undefined" ? { supportCircle } : {}),
      },
    );
  }

  return sendSuccess(res, {
    message: "Onboarding updated successfully.",
    data: await serializeAccount(req.account),
  });
}

export async function createNotificationToken(req, res) {
  const { platform, expoPushToken, deviceId, enabled } = req.validated.body;

  const token = await NotificationToken.findOneAndUpdate(
    { account: req.account._id, expoPushToken },
    {
      account: req.account._id,
      platform,
      expoPushToken,
      deviceId,
      enabled,
      lastSeenAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return sendSuccess(res, {
    status: 201,
    message: "Notification token saved successfully.",
    data: {
      id: token._id,
      platform: token.platform,
      expoPushToken: token.expoPushToken,
      deviceId: token.deviceId,
      enabled: token.enabled,
    },
  });
}

export async function deleteNotificationToken(req, res) {
  const token = await NotificationToken.findOneAndDelete({
    _id: req.params.id,
    account: req.account._id,
  });

  if (!token) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Notification token not found",
      status: 404,
      detail: "No notification token matched this request.",
      errors: [{ field: "id", code: "not_found" }],
    });
  }

  return sendSuccess(res, {
    message: "Notification token removed successfully.",
    data: null,
  });
}

export async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.validated.body;
  const matches = await bcrypt.compare(oldPassword, req.account.passwordHash);

  if (!matches) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/invalid-credentials",
      title: "Current password is incorrect",
      status: 400,
      detail: "The current password you entered is incorrect.",
      errors: [{ field: "oldPassword", code: "invalid_password" }],
    });
  }

  req.account.passwordHash = await bcrypt.hash(newPassword, 10);
  req.account.refreshTokens = [];
  await req.account.save();

  return sendSuccess(res, {
    message: "Password updated successfully.",
    data: null,
  });
}
