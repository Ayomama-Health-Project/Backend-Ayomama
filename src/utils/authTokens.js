import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateOtp(length = 4) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return `${Math.floor(min + Math.random() * (max - min))}`;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenTtl });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
