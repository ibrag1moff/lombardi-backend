import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "./payment";

export const getCart: (
  req: AuthenticatedRequest,
  res: Response
) => void = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  console.log(userId);

  try {
    const cart = await prisma.cart.findMany();

    if (!cart.length) return res.status(404).json({ error: "Cart is empty" });

    return res.status(200).json({ cart });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
