import Account from "../../models/Account.js";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import { sendSuccess } from "../../utils/problem.js";

export async function listHealthProfessionals(req, res) {
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requestedLimit)
    ? 5
    : Math.min(Math.max(requestedLimit, 1), 12);

  const accounts = await Account.aggregate([
    {
      $match: {
        role: "health_worker",
        status: "active",
        onboardingCompleted: true,
      },
    },
    { $sample: { size: limit } },
    {
      $project: {
        _id: 1,
        email: 1,
        healthWorkerType: 1,
      },
    },
  ]);

  const accountIds = accounts.map((account) => account._id);
  const profiles = await HealthWorkerProfile.find({ account: { $in: accountIds } }).lean();
  const profileMap = new Map(
    profiles.map((profile) => [String(profile.account), profile]),
  );

  return sendSuccess(res, {
    message: "Health professionals fetched successfully.",
    data: accounts.map((account) => {
      const profile = profileMap.get(String(account._id)) || {};
      const fullName = profile.fullName || "AYOMAMA Health Worker";
      const occupation = profile.occupation || "Health Professional";
      const facilityName = profile.facilityName || "";
      const hasClinic = account.healthWorkerType === "with_clinic";

      return {
        id: String(account._id),
        fullName,
        occupation,
        email: account.email,
        healthWorkerType: account.healthWorkerType,
        hasClinic,
        clinicLabel: hasClinic ? "With Clinic" : "Without Clinic",
        facilityName,
        subtitle: hasClinic && facilityName
          ? `${occupation}, ${facilityName}`
          : `${occupation}, Independent practice`,
      };
    }),
  });
}
