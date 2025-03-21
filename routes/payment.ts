import { verifyToken } from "../middlewares/auth";
import { createCheckoutSession } from "../controllers/payment";
import express from "express";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

export { router as stripeRouter };
