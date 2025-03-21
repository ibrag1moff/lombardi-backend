import express from "express";

import {
  addProduct,
  deleteProduct,
  getProducts,
  markProductAsPopular,
  updateProduct,
} from "../controllers/product";
import { isAdmin, verifyToken } from "../middlewares/auth";

const router = express.Router();

router.get("/", getProducts);

router.post("/popular/:id", verifyToken, isAdmin, markProductAsPopular);

router.post("/add", verifyToken, isAdmin, addProduct);

router.delete("/delete/:id", verifyToken, isAdmin, deleteProduct);

router.put("/update/:id", verifyToken, isAdmin, updateProduct);

export { router as productRouter };
