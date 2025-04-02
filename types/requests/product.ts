export type AddProductBody = {
  name: string;
  price: number;
  description: string;
  image: string[];
  brand: string;
  category: string[];
};

export type UpdateProductBody = {
  name?: string;
  price?: number;
  description?: string;
  brand: string;
  image: string[];
  category: string[];
};
