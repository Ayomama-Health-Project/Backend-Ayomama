import cron from "node-cron";
import Visit from "../models/Visit.js";
import { sendSMS } from "../services/smsService.js";
import { sendReminderEmail } from "../utils/email.js";

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("Running reminder job...");

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  try {
    // Find visits scheduled within the last 1-minute window
    const reminders = await Visit.find({
      reminderDateTime: { $gte: oneMinuteAgo, $lte: now },
      sent: false,
    }).populate("userId", "phoneNumber email fullName");

    for (let r of reminders) {
      try {
        // Send SMS
        await sendSMS(
          r.userId.phoneNumber,
          `Hi Mama 💛 Reminder: You have an appointment at ${r.hospitalName} with ${r.doctorName}.`
        );

        // Send Email
        await sendReminderEmail(r.userId.email, r);

        // Mark as sent
        r.sent = true;
        await r.save();

        console.log(
          `✅ Reminder sent to ${r.userId.phoneNumber} & ${r.userId.email}`
        );
      } catch (err) {
        console.error("❌ Failed to send reminder:", err.message);
      }
    }
  } catch (err) {
    console.error("Reminder job error:", err.message);
  }
});
