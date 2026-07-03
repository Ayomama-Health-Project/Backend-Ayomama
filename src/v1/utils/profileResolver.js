import AdminProfile from "../../models/AdminProfile.js";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import MotherProfile from "../../models/MotherProfile.js";
import NotificationToken from "../../models/NotificationToken.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { buildMotherContext } from "./motherContext.js";

export async function getProfileForAccount(account) {
  switch (account.role) {
    case "mother":
      return MotherProfile.findOne({ account: account._id }).lean();
    case "partner":
      return PartnerProfile.findOne({ account: account._id }).lean();
    case "health_worker":
      return HealthWorkerProfile.findOne({ account: account._id }).lean();
    case "admin":
    case "super_admin":
      return AdminProfile.findOne({ account: account._id }).lean();
    default:
      return null;
  }
}

export async function serializeAccount(account) {
  const [profile, notificationTokens, motherContext] = await Promise.all([
    getProfileForAccount(account),
    NotificationToken.find({ account: account._id, enabled: true }).lean(),
    buildMotherContext(account),
  ]);

  return {
    id: account._id,
    email: account.email,
    role: account.role,
    status: account.status,
    isEmailVerified: account.isEmailVerified,
    language: account.language,
    profilePicture: account.profilePicture,
    onboardingCompleted: account.onboardingCompleted,
    onboardingProgress: {
      flow: account.onboardingProgress?.flow || "",
      currentStep: account.onboardingProgress?.currentStep || 0,
      draft: account.onboardingProgress?.draft || {},
      updatedAt: account.onboardingProgress?.updatedAt || null,
    },
    motherType: account.motherType,
    healthWorkerType: account.healthWorkerType,
    profile,
    motherContext,
    notifications: {
      enabled: notificationTokens.length > 0,
      tokens: notificationTokens.map((token) => ({
        id: token._id,
        platform: token.platform,
        expoPushToken: token.expoPushToken,
        deviceId: token.deviceId,
        enabled: token.enabled,
      })),
    },
  };
}
