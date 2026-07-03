import bcrypt from "bcryptjs";
import Account from "../../models/Account.js";
import AdminProfile from "../../models/AdminProfile.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { serializeAccount } from "../utils/profileResolver.js";

export async function adminMe(req, res) {
  return sendSuccess(res, {
    message: "Admin account fetched successfully.",
    data: await serializeAccount(req.account),
  });
}

export async function createAdmin(req, res) {
  if (req.account.role !== "super_admin") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only super admins can create other admins.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  const { email, password, fullName, adminRole, permissions } = req.validated.body;
  const existing = await Account.findOne({ email: email.toLowerCase() });
  if (existing) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/conflict",
      title: "Account already exists",
      status: 409,
      detail: "An account already exists with this email address.",
      errors: [{ field: "email", code: "duplicate_email" }],
    });
  }

  const role = adminRole === "super_admin" ? "super_admin" : "admin";
  const account = await Account.create({
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role,
    status: "active",
    isEmailVerified: true,
    onboardingCompleted: true,
  });

  await AdminProfile.create({
    account: account._id,
    fullName,
    adminRole,
    permissions,
  });

  return sendSuccess(res, {
    status: 201,
    message: "Admin account created successfully.",
    data: await serializeAccount(account),
  });
}

export async function listAdmins(req, res) {
  if (!["admin", "super_admin"].includes(req.account.role)) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "You do not have permission to view admins.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  const adminAccounts = await Account.find({ role: { $in: ["admin", "super_admin"] } }).sort({ createdAt: -1 });
  const data = await Promise.all(adminAccounts.map((account) => serializeAccount(account)));

  return sendSuccess(res, {
    message: "Admins fetched successfully.",
    data,
  });
}

export async function updateAdmin(req, res) {
  if (req.account.role !== "super_admin") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only super admins can update admins.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  const account = await Account.findById(req.params.id);
  const adminProfile = await AdminProfile.findOne({ account: req.params.id });

  if (!account || !adminProfile) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Admin not found",
      status: 404,
      detail: "The requested admin account could not be found.",
      errors: [{ field: "id", code: "not_found" }],
    });
  }

  if (typeof req.validated.body.status !== "undefined") {
    account.status = req.validated.body.status;
    await account.save();
  }

  if (typeof req.validated.body.fullName !== "undefined") {
    adminProfile.fullName = req.validated.body.fullName;
  }

  if (typeof req.validated.body.permissions !== "undefined") {
    adminProfile.permissions = req.validated.body.permissions;
  }

  await adminProfile.save();

  return sendSuccess(res, {
    message: "Admin updated successfully.",
    data: await serializeAccount(account),
  });
}

export async function updateAccountStatus(req, res) {
  if (req.account.role !== "super_admin") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only super admins can update account statuses.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  const account = await Account.findById(req.params.id);
  if (!account) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Account not found",
      status: 404,
      detail: "The requested account could not be found.",
      errors: [{ field: "id", code: "not_found" }],
    });
  }

  account.status = req.validated.body.status;
  await account.save();

  return sendSuccess(res, {
    message: "Account status updated successfully.",
    data: await serializeAccount(account),
  });
}
