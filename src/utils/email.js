import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================
// SEND OTP EMAIL
// =======================
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Ayomama" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Ayomama Password Reset OTP 💛",
    html: `
      <div style="font-family: 'Poppins', sans-serif; color: #333;">
        <h2>Hi Mama 💛</h2>
        <p>Use the OTP below to reset your password. This code will expire in <strong>10 minutes</strong>.</p>
        <div style="font-size: 24px; font-weight: bold; color: #fdbf67; margin: 20px 0;">
          ${otp}
        </div>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p>— The Ayomama Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw new Error("Failed to send OTP email");
  }
};

// =======================
// SEND REMINDER EMAIL
// =======================
export const sendReminderEmail = async (email, visit) => {
  const mailOptions = {
    from: `"Ayomama" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Appointment Reminder 💛",
    html: `
      <div style="font-family: 'Poppins', sans-serif; color: #333;">
        <h2>Hi Mama 💛</h2>
        <p>This is a friendly reminder for your upcoming appointment:</p>
        <ul>
          <li><strong>Hospital:</strong> ${visit.hospitalName}</li>
          <li><strong>Doctor:</strong> ${visit.doctorName}</li>
          <li><strong>Date & Time:</strong> ${new Date(
            visit.reminderDateTime
          ).toLocaleString()}</li>
        </ul>
        <p>Please ensure to arrive a few minutes early. We’re always here for you 💛</p>
        <br/>
        <p>— The Ayomama Team 🤱🏽</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending reminder email:", error);
    throw new Error("Failed to send reminder email");
  }
};
