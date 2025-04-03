import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AddProductBody, UpdateProductBody } from "../types/requests/product";

export const getProducts: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await prisma.product.findMany();

    if (!products.length)
      return res.status(404).json({ message: "Products not found" });

    res.status(200).json({ products });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const markProductAsPopular: (
  req: Request,
  res: Response
) => void = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { popular: true },
    });

    return res.status(200).json({
      message: "Product successfully marked as popular",
      product: updatedProduct,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const addProduct: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { name, price, description, image, brand, category } =
    req.body as AddProductBody;
  try {
    if (!name || !price || !category || !image)
      return res.status(400).json({ error: "Missing required fields" });

    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        image,
        brand,
        category,
      },
    });

    if (!product)
      return res.status(400).json({ error: "Error adding product" });

    res.status(201).json({ message: "Product successfully added", product });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const deleteProduct: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params as { id: string };
  try {
    const product = await prisma.product.delete({ where: { id } });

    if (!product) return res.status(404).json({ error: "Product not found" });

    return res
      .status(200)
      .json({ message: "Product successfully deleted", product });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const updateProduct: (req: Request, res: Response) => void = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params as { id: string };
  const { name, price, description, category, brand, image } =
    req.body as UpdateProductBody;

  try {
    // Only include fields that are provided in the request body
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price }),
        ...(description && { description }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(image && { image }),
      },
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      message: "Product successfully updated",
      product: updatedProduct,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
