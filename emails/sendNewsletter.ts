import nodemailer from "nodemailer";
import { prisma } from "../config/prisma";

export async function sendNewsletter(subject: string, content: string) {
  try {
    const subscribers = await prisma.subscriber.findMany();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    for (const subscriber of subscribers) {
      const mailOptions = {
        from: "Luca Lombardi",
        to: subscriber.email,
        subject,
        text: content,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Newsletter sent to: ${subscriber.email}`);
    }
  } catch (e) {
    console.error(e);
  }
}
