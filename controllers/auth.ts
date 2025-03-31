import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";
import { LoginBody, RegisterBody } from "../types/body";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies";
import { sendWelcomeEmail } from "../emails/sendWelcomeEmail";
import { sendForgotPasswordEmail } from "../emails/sendForgotPasswordEmail";
import { sendSuccessResetPasswordEmail } from "../emails/sendSuccessResetPasswordEmail";
import redis from "../config/redis";

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

    const rateLimitKey = `registration_rate:${email}`;
    const registrationRateLimited = await redis.get(rateLimitKey);

    if (registrationRateLimited) {
      return res.status(429).json({
        error: "Too many registration attempts. Please try again later.",
      });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters long" });
    }

    const cachedUser = await redis.get(`user:${email}`);
    if (cachedUser) {
      return res.status(400).json({ error: "User already exists" });
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

    await redis.set(`user:${email}`, JSON.stringify(user), { EX: 3600 });

    const token = generateTokenAndSetCookies(res, user.id);

    await sendWelcomeEmail(user.email, user.name!);

    await redis.set(rateLimitKey, "1", { EX: 60 });

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

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const userCacheKey = `user:${user.id}`;
    const failedAttemptsKey = `failed_login:${user.id}`;

    const attempts = parseInt((await redis.get(failedAttemptsKey)) || "0", 10);
    if (attempts >= 3)
      return res
        .status(429)
        .json({ error: "Too many failed attempts. Please try again later." });

    const cachedUser = await redis.get(userCacheKey);

    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      await redis.set(userCacheKey, JSON.stringify(user), { EX: 3600 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await redis.incr(failedAttemptsKey);
      await redis.expire(failedAttemptsKey, 300);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    await redis.del(failedAttemptsKey);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateTokenAndSetCookies(res, user.id);

    await redis.set(`session:${user.id}`, token, { EX: 86400 });

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
    const rateLimitKey = `otp_rate:${email}`;
    const rateLimited = await redis.get(rateLimitKey);

    if (rateLimited)
      return res
        .status(429)
        .json({ error: "Too many requests. Please try again in 1 minute." });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpCacheKey = `otp:${email}`;

    const multi = redis.multi();

    multi.set(otpCacheKey, otpCode);
    multi.expire(otpCacheKey, 600);

    multi.set(rateLimitKey, "1");
    multi.expire(rateLimitKey, 60);

    await multi.exec();

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
