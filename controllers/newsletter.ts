import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendNewsletter } from "../emails/sendNewsletter";
import { SendNewsletterType } from "types/requests/newsletter";

export const subscribeToNewsletter: (
  req: Request,
  res: Response
) => void = async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber)
      return res.status(400).json({ error: "User is already subscribed" });

    await prisma.subscriber.create({
      data: {
        email,
      },
    });

    return res.status(201).json({ message: "User successfully subscribed " });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const sendNewsletterToUser: (
  req: Request,
  res: Response
) => void = async (req: Request, res: Response) => {
  const { subject, content } = req.body as SendNewsletterType;

  if (!subject || !content)
    return res.status(400).json({ error: "Subject and content required" });

  try {
    await sendNewsletter(subject, content);
    res.status(200).json({ message: "Newsletter sent successfully" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const deleteSubscriber: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body as { email: string };

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { email } });

    if (!subscriber)
      return res.status(404).json({ error: "Subscriber not found" });

    await prisma.subscriber.delete({
      where: { email },
    });

    res.status(200).json({ message: "Subscriber successfully deleted" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
