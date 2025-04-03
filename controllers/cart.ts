import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AddToCartBody, RemoveFromCartParams } from "types/requests/cart";

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

  const { productId, name, quantity, price } = req.body as AddToCartBody;

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        name,
        quantity,
        price,
      },
    });

    res.status(201).json({ message: "Successfully added to cart", cartItem });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const removeFromCart: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { cartItemId } = req.params as RemoveFromCartParams;
  try {
    if (!cartItemId)
      return res.status(404).json({ error: "Cart item not found" });

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    res.status(200).json({ message: "Successfully deleted" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const clearCart: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user.userId;
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(200).json({ message: "Successfully cleared" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
