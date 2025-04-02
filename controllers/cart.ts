import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getCart: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.userId;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) return res.status(404).json({ error: "Cart is empty" });

    res.status(200).json(cart);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const addToCart: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.userId;

  try {
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
