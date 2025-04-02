import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Middleware to verify JWT token
export const verifyToken: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    // @ts-ignore
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Middleware to verify user's role
export const isAdmin: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user?.role === "ADMIN" || user?.role === "OWNER") {
      return next();
    }

    res.status(401).json({ error: "You do not have admin priviliges" });
  } catch (e: any) {
    console.error(e);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
