export type RegisterBody = {
  email: string;
  name: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

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

export type CheckoutItem = {};

export type CreateCheckoutSessionBody = {
  customerEmail: string;
  items: CheckoutItem[];
};
