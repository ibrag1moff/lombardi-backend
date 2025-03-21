import { Response } from "express";
import jwt from "jsonwebtoken";

export function generateTokenAndSetCookies(res: Response, userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  });

  return token;
}
