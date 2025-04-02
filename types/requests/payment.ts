export type CheckoutItem = {};

export type CreateCheckoutSessionBody = {
  customerEmail: string;
  items: CheckoutItem[];
};
