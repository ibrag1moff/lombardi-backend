export type AddToCartBody = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type RemoveFromCartParams = {
  cartItemId: string;
};
