import bcrypt from "bcryptjs";
import Account from "../../models/Account.js";
import AdminProfile from "../../models/AdminProfile.js";
import HealthWorkerProfile from "../../models/HealthWorkerProfile.js";
import MotherProfile from "../../models/MotherProfile.js";
import PartnerInvite from "../../models/PartnerInvite.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { env } from "../../config/env.js";
import {
  generateOtp,
  hashValue,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/authTokens.js";
import { sendPasswordResetOtpEmail } from "../../utils/brevo.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";
import { serializeAccount } from "../utils/profileResolver.js";

const REFRESH_COOKIE = "ayomama_refresh_token";

function buildTokenPayload(account) {
  return {
    sub: account._id.toString(),
    role: account.role,
    motherType: account.motherType,
    healthWorkerType: account.healthWorkerType,
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

async function issueSession(account, req, res) {
  const accessToken = signAccessToken(buildTokenPayload(account));
  const refreshToken = signRefreshToken(buildTokenPayload(account));
  const decoded = verifyRefreshToken(refreshToken);
  const tokenHash = hashValue(refreshToken);

  account.refreshTokens = [
    ...(account.refreshTokens || []).filter((item) => item.expiresAt > new Date()).slice(-4),
    {
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: req.headers["user-agent"] || "",
      lastUsedAt: new Date(),
    },
  ];
  account.lastLoginAt = new Date();
  await account.save();

  if (account.role === "admin" || account.role === "super_admin") {
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  }

  return { accessToken, refreshToken };
}

async function createAccount({ email, password, role, language, motherType = null, healthWorkerType = null }) {
  const existing = await Account.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { error: "duplicate" };
  }

  const account = await Account.create({
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role,
    language: language || "en",
    motherType,
    healthWorkerType,
    status: "pending_onboarding",
  });

  return { account };
}

export async function registerMother(req, res) {
  const { body } = req.validated;
  const { account, error } = await createAccount({
    email: body.email,
    password: body.password,
    role: "mother",
    language: body.language,
    motherType: body.motherType,
  });

  if (error === "duplicate") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/conflict",
      title: "Account already exists",
      status: 409,
      detail: "An account already exists with this email address.",
      errors: [{ field: "email", code: "duplicate_email" }],
    });
  }

  await MotherProfile.create({
    account: account._id,
    fullName: body.fullName,
    phoneNumber: body.phoneNumber,
    address: body.address,
    dueDate: body.dueDate || null,
    lastPeriodDate: body.lastPeriodDate || null,
    pregnancyWeek: body.pregnancyWeek ?? null,
    babyName: body.babyName,
    babyNickname: body.babyNickname,
    babyBirthDate: body.babyBirthDate || null,
    babyBirthWeight: body.babyBirthWeight,
    babyBirthHospital: body.babyBirthHospital,
    healthConcerns: body.healthConcerns,
    emergencyContacts: body.emergencyContacts,
  });

  const tokens = await issueSession(account, req, res);
  return sendSuccess(res, {
    status: 201,
    message: "Mother account created successfully.",
    data: {
      tokens,
      account: await serializeAccount(account),
    },
  });
}

export async function registerPartner(req, res) {
  const { body } = req.validated;
  const normalizedInviteToken = (body.inviteToken || "").trim().toUpperCase();
  const invite = await PartnerInvite.findOne({
    $or: [
      { inviteCode: normalizedInviteToken },
      { tokenHash: hashValue(body.inviteToken) },
      { tokenHash: hashValue(normalizedInviteToken) },
    ],
    acceptedByAccount: null,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!invite) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/invite-invalid",
      title: "Invite is invalid",
      status: 400,
      detail: "This partner invite is invalid, expired, or has already been used.",
      errors: [{ field: "inviteToken", code: "invalid_invite" }],
    });
  }

  const { account, error } = await createAccount({
    email: body.email,
    password: body.password,
    role: "partner",
    language: body.language,
  });

  if (error === "duplicate") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/conflict",
      title: "Account already exists",
      status: 409,
      detail: "An account already exists with this email address.",
      errors: [{ field: "email", code: "duplicate_email" }],
    });
  }

  await PartnerProfile.create({
    account: account._id,
    fullName: body.fullName,
    phoneNumber: body.phoneNumber,
    relationshipLabel: body.relationshipLabel,
    linkedMotherAccount: invite.inviterAccount,
    inviteAcceptedAt: new Date(),
  });

  invite.acceptedByAccount = account._id;
  invite.usedAt = new Date();
  await invite.save();

  const tokens = await issueSession(account, req, res);
  return sendSuccess(res, {
    status: 201,
    message: "Partner account created successfully.",
    data: {
      tokens,
      account: await serializeAccount(account),
    },
  });
}

export async function registerHealthWorker(req, res) {
  const { body } = req.validated;
  const { account, error } = await createAccount({
    email: body.email,
    password: body.password,
    role: "health_worker",
    language: body.language,
    healthWorkerType: body.healthWorkerType,
  });

  if (error === "duplicate") {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/conflict",
      title: "Account already exists",
      status: 409,
      detail: "An account already exists with this email address.",
      errors: [{ field: "email", code: "duplicate_email" }],
    });
  }

  await HealthWorkerProfile.create({
    account: account._id,
    fullName: body.fullName,
    phoneNumber: body.phoneNumber,
    state: body.state,
    localGovernment: body.localGovernment,
    occupation: body.occupation,
    facilityName: body.facilityName,
    facilityCode: body.facilityCode,
  });

  const tokens = await issueSession(account, req, res);
  return sendSuccess(res, {
    status: 201,
    message: "Health worker account created successfully.",
    data: {
      tokens,
      account: await serializeAccount(account),
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const account = await Account.findOne({ email: email.toLowerCase() });

  if (!account) {
    return sendProblem(res, req, {
      type: "/problems/account-not-found",
      title: "Account not found",
      status: 404,
      detail: "No AYOMAMA account exists with this email address.",
      errors: [{ field: "email", code: "account_not_found" }],
    });
  }

  if (!(await bcrypt.compare(password, account.passwordHash))) {
    return sendProblem(res, req, {
      type: "/problems/incorrect-password",
      title: "Incorrect password",
      status: 401,
      detail: "The password entered for this email address is incorrect.",
      errors: [{ field: "password", code: "incorrect_password" }],
    });
  }

  if (account.role === "admin" || account.role === "super_admin") {
    const adminProfile = await AdminProfile.findOne({ account: account._id });
    if (!adminProfile) {
      return sendProblem(res, req, {
        type: "https://veridom.com/problems/forbidden",
        title: "Admin profile missing",
        status: 403,
        detail: "This admin account is not configured correctly.",
        errors: [{ field: "role", code: "admin_profile_missing" }],
      });
    }
  }

  const tokens = await issueSession(account, req, res);
  return sendSuccess(res, {
    message: "Login successful.",
    data: {
      tokens,
      account: await serializeAccount(account),
    },
  });
}

export async function adminLogin(req, res) {
  const { email, password } = req.validated.body;
  const account = await Account.findOne({ email: email.toLowerCase() });

  if (!account || !["admin", "super_admin"].includes(account.role)) {
    return sendProblem(res, req, {
      type: "/problems/account-not-found",
      title: "Admin account not found",
      status: 404,
      detail: "No admin account exists with this email address.",
      errors: [{ field: "email", code: "account_not_found" }],
    });
  }

  if (!(await bcrypt.compare(password, account.passwordHash))) {
    return sendProblem(res, req, {
      type: "/problems/incorrect-password",
      title: "Incorrect password",
      status: 401,
      detail: "The password entered for this admin account is incorrect.",
      errors: [{ field: "password", code: "incorrect_password" }],
    });
  }

  const tokens = await issueSession(account, req, res);
  return sendSuccess(res, {
    message: "Admin login successful.",
    data: {
      tokens,
      account: await serializeAccount(account),
    },
  });
}

export async function refresh(req, res) {
  const incomingToken = req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE];

  if (!incomingToken) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/unauthorized",
      title: "Refresh token missing",
      status: 401,
      detail: "A refresh token is required to renew this session.",
      errors: [{ field: "refreshToken", code: "missing" }],
    });
  }

  try {
    const payload = verifyRefreshToken(incomingToken);
    const account = await Account.findById(payload.sub);
    const incomingHash = hashValue(incomingToken);

    if (!account || !(account.refreshTokens || []).some((token) => token.tokenHash === incomingHash)) {
      return sendProblem(res, req, {
        type: "https://veridom.com/problems/unauthorized",
        title: "Refresh token invalid",
        status: 401,
        detail: "This refresh token is no longer valid.",
        errors: [{ field: "refreshToken", code: "invalid" }],
      });
    }

    account.refreshTokens = (account.refreshTokens || []).filter((token) => token.tokenHash !== incomingHash);
    const tokens = await issueSession(account, req, res);

    return sendSuccess(res, {
      message: "Session refreshed.",
      data: {
        tokens,
        account: await serializeAccount(account),
      },
    });
  } catch (error) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/unauthorized",
      title: "Refresh token invalid",
      status: 401,
      detail: "This refresh token has expired or is invalid.",
      errors: [{ field: "refreshToken", code: "expired_or_invalid" }],
    });
  }
}

export async function logout(req, res) {
  const incomingToken = req.body?.refreshToken || req.cookies?.[REFRESH_COOKIE];

  if (req.account && incomingToken) {
    const incomingHash = hashValue(incomingToken);
    req.account.refreshTokens = (req.account.refreshTokens || []).filter((token) => token.tokenHash !== incomingHash);
    await req.account.save();
  }

  const cookieOptions = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return sendSuccess(res, {
    message: "Logout successful.",
    data: null,
  });
}

export async function me(req, res) {
  return sendSuccess(res, {
    message: "Current account fetched successfully.",
    data: await serializeAccount(req.account),
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.validated.body;
  const account = await Account.findOne({ email: email.toLowerCase() });

  if (!account) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Account not found",
      status: 404,
      detail: "No account exists for this email address.",
      errors: [{ field: "email", code: "not_found" }],
    });
  }

  const now = new Date();
  if (account.passwordReset?.resendAvailableAt && account.passwordReset.resendAvailableAt > now) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/too-many-requests",
      title: "OTP recently sent",
      status: 429,
      detail: "Please wait before requesting another reset code.",
      errors: [{ field: "email", code: "otp_cooldown" }],
    });
  }

  const otp = generateOtp();
  account.passwordReset = {
    otpHash: hashValue(otp),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
    resendAvailableAt: new Date(Date.now() + 60 * 1000),
    verifiedAt: null,
  };
  await account.save();

  await sendPasswordResetOtpEmail({ email: account.email, otp });

  return sendSuccess(res, {
    message: "Password reset OTP sent successfully.",
    data: {
      email: account.email,
      expiresInSeconds: 600,
    },
  });
}

export async function adminForgotPassword(req, res) {
  const { email } = req.validated.body;
  const account = await Account.findOne({
    email: email.toLowerCase(),
    role: { $in: ["admin", "super_admin"] },
  });

  if (!account) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Account not found",
      status: 404,
      detail: "No admin account exists for this email address.",
      errors: [{ field: "email", code: "not_found" }],
    });
  }

  req.validated.body.email = account.email;
  return forgotPassword(req, res);
}

export async function verifyResetOtp(req, res) {
  const { email, otp } = req.validated.body;
  const account = await Account.findOne({ email: email.toLowerCase() });

  if (!account || !account.passwordReset?.otpHash) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Reset request not found",
      status: 404,
      detail: "There is no active reset request for this email.",
      errors: [{ field: "email", code: "reset_request_not_found" }],
    });
  }

  if (account.passwordReset.expiresAt < new Date()) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/otp-expired",
      title: "OTP expired",
      status: 400,
      detail: "This OTP has expired. Please request another one.",
      errors: [{ field: "otp", code: "expired_otp" }],
    });
  }

  if (account.passwordReset.attempts >= 5) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/too-many-requests",
      title: "Too many invalid attempts",
      status: 429,
      detail: "Too many invalid OTP attempts. Please request a new code.",
      errors: [{ field: "otp", code: "attempt_limit_reached" }],
    });
  }

  if (account.passwordReset.otpHash !== hashValue(otp)) {
    account.passwordReset.attempts += 1;
    await account.save();
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/otp-invalid",
      title: "Invalid OTP",
      status: 400,
      detail: "The code you entered is incorrect.",
      errors: [{ field: "otp", code: "invalid_otp" }],
    });
  }

  account.passwordReset.verifiedAt = new Date();
  await account.save();

  return sendSuccess(res, {
    message: "OTP verified successfully.",
    data: { verified: true },
  });
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.validated.body;
  const account = await Account.findOne({ email: email.toLowerCase() });

  if (!account || !account.passwordReset?.otpHash) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Reset request not found",
      status: 404,
      detail: "There is no active reset request for this email.",
      errors: [{ field: "email", code: "reset_request_not_found" }],
    });
  }

  if (account.passwordReset.expiresAt < new Date()) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/otp-expired",
      title: "OTP expired",
      status: 400,
      detail: "This OTP has expired. Please request another one.",
      errors: [{ field: "otp", code: "expired_otp" }],
    });
  }

  if (account.passwordReset.otpHash !== hashValue(otp)) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/otp-invalid",
      title: "Invalid OTP",
      status: 400,
      detail: "The code you entered is incorrect.",
      errors: [{ field: "otp", code: "invalid_otp" }],
    });
  }

  account.passwordHash = await bcrypt.hash(newPassword, 10);
  account.passwordReset = {
    otpHash: null,
    expiresAt: null,
    attempts: 0,
    resendAvailableAt: null,
    verifiedAt: null,
  };
  account.refreshTokens = [];
  await account.save();

  return sendSuccess(res, {
    message: "Password reset successful.",
    data: null,
  });
}

export async function adminResetPassword(req, res) {
  const { email } = req.validated.body;
  const account = await Account.findOne({
    email: email.toLowerCase(),
    role: { $in: ["admin", "super_admin"] },
  });

  if (!account) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/not-found",
      title: "Account not found",
      status: 404,
      detail: "No admin account exists for this email address.",
      errors: [{ field: "email", code: "not_found" }],
    });
  }

  req.validated.body.email = account.email;
  return resetPassword(req, res);
}
