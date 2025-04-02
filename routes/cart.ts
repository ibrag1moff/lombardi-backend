import express from "express";
import { getCart } from "../controllers/cart";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.get("/", verifyToken, getCart);

export { router as cartRouter };
