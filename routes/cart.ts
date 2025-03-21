import express from "express";

import { getCart } from "../controllers/cart";

const router = express.Router();

router.get("/", getCart);

export { router as cartRouter };
