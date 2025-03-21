import express, { Request, Response } from "express";

import {
  deleteAccount,
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  verifyOTP,
} from "../controllers/auth";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP, (req: Request, res: Response) => {
  res.status(200).json({ message: "OTP verified successfully" });
});

router.post("/reset-password", verifyOTP, resetPassword);

router.delete("/delete", deleteAccount);

router.get("/me", getMe);

export { router as authRouter };
