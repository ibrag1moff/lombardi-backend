import cron from "node-cron";
import { sendNewsletter } from "../emails/sendNewsletter";

export const startNewsletter = () => {
  cron.schedule("0 0 */2 * *", async () => {
    console.log("⏰ Running scheduled newsletter...");
    await sendNewsletter("Test Newsletter", "This is your test content 🚀");
  });

  console.log("✅ Newsletter cron job started");
};
