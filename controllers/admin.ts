import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const assignAdmin: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role == "ADMIN")
      return res.status(400).json({ error: "User is already admin" });

    if (user.role == "OWNER")
      return res.status(400).json({ error: "User has higher role than admin" });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    return res
      .status(200)
      .json({ message: "User role updated to ADMIN", user: updatedUser });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const revokeAdmin: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body as { email: string };

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "USER")
      return res.status(400).json({ error: "User is not admin" });

    if (user.role === "OWNER")
      return res.status(400).json({ error: "You can't revoke owner" });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "USER" },
    });

    return res
      .status(200)
      .json({ message: "User successfully revoked", user: updatedUser });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const banUser: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body as { email: string };

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "OWNER")
      return res.status(401).json({ error: "You can't ban the owner" });

    await prisma.user.delete({
      where: { email },
    });

    res.status(200).json({ message: "User successfully deleted" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getUsers: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    if (!users.length)
      return res.status(404).json({ error: "Users not found" });

    return res.status(200).json({ users });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getAdmins: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    if (!admins.length)
      return res.status(404).json({ error: "Admins not found" });

    return res.status(200).json({ admins });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
