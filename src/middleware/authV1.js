import Account from "../models/Account.js";
import { verifyAccessToken } from "../utils/authTokens.js";
import { sendProblem } from "../utils/problem.js";

async function resolveAccount(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  const account = await Account.findById(payload.sub);
  if (!account) {
    return null;
  }

  req.auth = { token, payload, account };
  req.account = account;
  return account;
}

export async function requireAuth(req, res, next) {
  try {
    const account = await resolveAccount(req);
    if (!account) {
      return sendProblem(res, req, {
        type: "https://veridom.com/problems/unauthorized",
        title: "Unauthorized",
        status: 401,
        detail: "You must be logged in to access this resource.",
        errors: [{ field: "authorization", code: "missing_or_invalid" }],
      });
    }
    next();
  } catch (error) {
    return sendProblem(res, req, {
      type: "https://veridom.com/problems/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Your session is invalid or expired.",
      errors: [{ field: "authorization", code: "invalid_token" }],
    });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.account || !roles.includes(req.account.role)) {
      return sendProblem(res, req, {
        type: "https://veridom.com/problems/forbidden",
        title: "Forbidden",
        status: 403,
        detail: "You do not have permission to perform this action.",
        errors: [{ field: "role", code: "forbidden_role" }],
      });
    }
    next();
  };
}
