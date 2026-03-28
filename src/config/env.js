import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET", "BREVO_FROM_EMAIL", "BREVO_FROM_NAME", "BREVO_FROM_API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "change-me-refresh",
  accessTokenTtl: process.env.JWT_ACCESS_TTL || "15m",
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || "30d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8081",
  adminUrl: process.env.ADMIN_URL || "http://localhost:3001",
  brevoFromEmail: process.env.BREVO_FROM_EMAIL,
  brevoFromName: process.env.BREVO_FROM_NAME,
  brevoApiKey: process.env.BREVO_FROM_API_KEY,
};
