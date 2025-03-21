import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";
import { LoginBody, RegisterBody } from "types/requests";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies";
import { sendWelcomeEmail } from "../emails/sendWelcomeEmail";
import { sendForgotPasswordEmail } from "../emails/sendForgotPasswordEmail";
import { sendSuccessResetPasswordEmail } from "../emails/sendSuccessResetPasswordEmail";

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const register: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email, name, password } = req.body as RegisterBody;

  try {
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const token = generateTokenAndSetCookies(res, user.id);

    await sendWelcomeEmail(user.email, user.name!);

    res.status(201).json({ message: "User successfully registered", token });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const login: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body as LoginBody;

  try {
    if (!email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateTokenAndSetCookies(res, user.id);

    res.status(200).json({ message: "User successfully logged in", token });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const forgotPassword: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body as { email: string };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const otpCode = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: otpCode,
        resetTokenExpiresAt: new Date(Date.now() + 600000),
      },
    });

    await sendForgotPasswordEmail(user.name!, email, otpCode);

    res.status(200).json({ message: "OTP Code was sent to your email" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const verifyOTP: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, otp } = req.body as { userId: string; otp: string };

  if (!userId || !otp) {
    return res.status(400).json({ error: "User ID and OTP are required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const currentTime = new Date();
    const expirationTime = new Date(user.resetTokenExpiresAt!);
    if (currentTime > expirationTime) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    if (otp === user.resetToken) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });

      return next();
    }

    return res.status(400).json({ error: "Wrong OTP" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const resetPassword: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { userId, password } = req.body as {
    userId: string;
    password: string;
    otp: string;
  };

  if (!userId || !password)
    return res.status(400).json({ error: "User ID and Password are required" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    await sendSuccessResetPasswordEmail(user.name!, user.email);

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const deleteAccount: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(400).json({ error: "Invalid token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.user.delete({ where: { id: user.id } });

    res.clearCookie("token");

    res.status(200).json({ message: "User successfully deleted" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getMe: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(400).json({ error: "Invalid token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        stripeCustomerId: true,
        lastLoginAt: true,
        createdAt: true,
        carts: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
