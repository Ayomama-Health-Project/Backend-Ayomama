import axios from "axios";
import { env } from "../config/env.js";

export async function sendBrevoEmail({ to, subject, htmlContent }) {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        email: env.brevoFromEmail,
        name: env.brevoFromName,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
    {
      headers: {
        "api-key": env.brevoApiKey,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );
}

export async function sendPasswordResetOtpEmail({ email, otp }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <div style="border: 1px solid #d7eeea; border-radius: 24px; padding: 32px; background: linear-gradient(180deg, #f1fffd 0%, #ffffff 100%);">
        <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">AYOMAMA</p>
        <h1 style="margin: 0 0 16px; font-size: 24px; color: #0f172a;">Password reset code</h1>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6;">Use this one-time code to reset your password. It expires in 10 minutes.</p>
        <div style="margin: 0 0 24px; padding: 18px 20px; border-radius: 18px; background: #006d5b; color: white; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 8px;">
          ${otp}
        </div>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendBrevoEmail({
    to: email,
    subject: "Your AYOMAMA password reset code",
    htmlContent,
  });
}
