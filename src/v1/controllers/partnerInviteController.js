import crypto from "crypto";
import { env } from "../../config/env.js";
import PartnerInvite from "../../models/PartnerInvite.js";
import { hashValue } from "../../utils/authTokens.js";
import { sendProblem, sendSuccess } from "../../utils/problem.js";

async function generateInviteCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `AYOMAMA${crypto.randomInt(1000, 10000)}`;
    // eslint-disable-next-line no-await-in-loop
    const existing = await PartnerInvite.findOne({
      $or: [{ inviteCode: code }, { token: code }],
    }).select("_id");
    if (!existing) {
      return code;
    }
  }

  return `AYOMAMA${Date.now().toString().slice(-6)}`;
}

function normalizeInviteToken(token) {
  return (token || "").trim().toUpperCase();
}

async function findActiveInvite(token) {
  const normalizedToken = normalizeInviteToken(token);
  return PartnerInvite.findOne({
    $or: [
      { inviteCode: normalizedToken },
      { token: normalizedToken },
      { tokenHash: hashValue(token) },
      { tokenHash: hashValue(normalizedToken) },
    ],
    acceptedByAccount: null,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

export async function createPartnerInvite(req, res) {
  if (req.account.role !== "mother") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only mothers can create partner invites.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  const inviteCode = await generateInviteCode();
  const activeInvite = await PartnerInvite.findOne({
    inviterAccount: req.account._id,
    acceptedByAccount: null,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  let invite;
  if (activeInvite) {
    activeInvite.invitedEmail = req.validated.body.invitedEmail || "";
    activeInvite.token = inviteCode;
    activeInvite.inviteCode = inviteCode;
    activeInvite.tokenHash = hashValue(inviteCode);
    activeInvite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    activeInvite.usedAt = null;
    activeInvite.acceptedByAccount = null;
    invite = await activeInvite.save();
  } else {
    invite = await PartnerInvite.create({
      inviterAccount: req.account._id,
      invitedEmail: req.validated.body.invitedEmail || "",
      token: inviteCode,
      inviteCode,
      tokenHash: hashValue(inviteCode),
    });
  }

  return sendSuccess(res, {
    status: 201,
    message: "Partner invite created successfully.",
    data: {
      id: invite._id,
      token: inviteCode,
      inviteCode,
      inviteUrl: `${env.frontendUrl.replace(/\/$/, "")}/auth/partner/signup?inviteToken=${inviteCode}`,
      expiresAt: invite.expiresAt,
      invitedEmail: invite.invitedEmail,
    },
  });
}

export async function getPartnerInvite(req, res) {
  const invite = await findActiveInvite(req.params.token).populate("inviterAccount", "email role");

  if (!invite) {
    return sendProblem(res, req, {
      type: "/problems/invite-invalid",
      title: "Invite is invalid",
      status: 404,
      detail: "This partner invite is invalid or expired.",
      errors: [{ field: "token", code: "invalid_invite" }],
    });
  }

  return sendSuccess(res, {
    message: "Partner invite fetched successfully.",
    data: {
      token: invite.inviteCode || normalizeInviteToken(req.params.token),
      inviteCode: invite.inviteCode || normalizeInviteToken(req.params.token),
      inviteUrl: `${env.frontendUrl.replace(/\/$/, "")}/auth/partner/signup?inviteToken=${invite.inviteCode || normalizeInviteToken(req.params.token)}`,
      invitedEmail: invite.invitedEmail,
      expiresAt: invite.expiresAt,
      inviter: invite.inviterAccount,
    },
  });
}

export async function acceptPartnerInvite(req, res) {
  const invite = await findActiveInvite(req.params.token);

  if (!invite) {
    return sendProblem(res, req, {
      type: "/problems/invite-invalid",
      title: "Invite is invalid",
      status: 404,
      detail: "This partner invite is invalid or expired.",
      errors: [{ field: "token", code: "invalid_invite" }],
    });
  }

  if (req.account.role !== "partner") {
    return sendProblem(res, req, {
      type: "/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only partner accounts can accept partner invites.",
      errors: [{ field: "role", code: "forbidden_role" }],
    });
  }

  invite.usedAt = new Date();
  invite.acceptedByAccount = req.account._id;
  await invite.save();

  return sendSuccess(res, {
    message: "Partner invite accepted successfully.",
    data: {
      acceptedAt: invite.usedAt,
    },
  });
}
