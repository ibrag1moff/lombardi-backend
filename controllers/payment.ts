import { Request, Response } from "express";

import { stripe } from "../config/stripe";
import { prisma } from "../config/prisma";

import { CreateCheckoutSessionBody } from "../types/requests/payment";

export const createCheckoutSession: (
  req: Request,
  res: Response
) => void = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name!,
      metadata: { userId: user.id.toString() },
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  const { customerEmail, items } = req.body as CreateCheckoutSessionBody;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
