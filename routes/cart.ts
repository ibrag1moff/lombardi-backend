import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
} from "../controllers/cart";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.get("/", verifyToken, getCart);

router.post("/add", verifyToken, addToCart);

router.delete("/delete/:cartItemId", verifyToken, removeFromCart);

router.delete("/clear", verifyToken, clearCart);

export { router as cartRouter };
