import api from "./axios";
import { getToken } from "../utilites/auth";
import type { Product } from "../types/product";

export interface CartItemResponseDto {
  id: number;
  product: Product;
  quantity: number;
}

export interface CartItemDto {
  productId: number;
  quantity: number;
}

export const fetchCart = async (): Promise<CartItemResponseDto[]> => {
  const token = getToken();
  const res = await api.get<CartItemResponseDto[]>(`/cart`, {
    params: { token },
  });
  return res.data;
};

export const addToCart = async (item: CartItemDto): Promise<void> => {
  const token = getToken();
  await api.post(`/cart/add`, item, {
    params: { token },
  });
};

export const removeFromCart = async (cartItemId: number): Promise<void> => {
  const token = getToken();
  await api.delete(`/cart/${cartItemId}`, {
    params: { token },
  });
};

export const clearCart = async (): Promise<void> => {
  const token = getToken();
  await api.delete(`/cart/clear`, {
    params: { token },
  });
};
