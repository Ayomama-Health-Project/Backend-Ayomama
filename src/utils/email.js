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
    subject: "Your Ayomama Password Reset OTP",
    html: `
      <div style="
        font-family: 'Poppins', sans-serif;
        background-color: #fff;
        color: #000;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        margin: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      ">
        <h2 style="text-align: center; font-weight: 600;">Hi Mama 🤱🏽</h2>
        <p style="font-size: 15px; line-height: 1.6; text-align: center;">
          Use the code below to reset your password. It will expire in 
          <strong>10 minutes</strong>.
        </p>
        <h1 style="
          font-size: 36px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 6px;
        ">
          ${otp}
        </h1>
        <p style="font-size: 14px; color: #555; text-align: center;">
          If you didn’t request this, please ignore this email.
        </p>
        <br/>
        <p style="text-align: center; font-size: 14px;">— The Ayomama Team</p>
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
    subject: "Appointment Reminder 🤱🏽",
    html: `
      <div style="
        font-family: 'Poppins', sans-serif;
        background-color: #fff;
        color: #000;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        margin: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      ">
        <h2 style="text-align: center; font-weight: 600;">Hi Mama 🤱🏽</h2>
        <p style="font-size: 15px; line-height: 1.6; text-align: center;">
          This is a friendly reminder for your upcoming appointment:
        </p>
        <div style="margin: 20px 0; text-align: center;">
          <p><strong>Hospital:</strong> ${visit.hospitalName}</p>
          <p><strong>Doctor:</strong> ${visit.doctorName}</p>
          <p><strong>Date & Time:</strong> ${new Date(
            visit.reminderDateTime
          ).toLocaleString()}</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; text-align: center;">
          Please arrive a few minutes early. We're always here for you. 💕
        </p>
        <br/>
        <p style="text-align: center; font-size: 14px;">— The Ayomama Team</p>
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
