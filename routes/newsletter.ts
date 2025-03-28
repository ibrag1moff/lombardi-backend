import express from "express";
import {
  sendNewsletterToUser,
  subscribeToNewsletter,
} from "../controllers/newsletter";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.post("/subscribe", verifyToken, subscribeToNewsletter);

router.post("/send-newsletter", verifyToken, sendNewsletterToUser);

export { router as newsletterRouter };
