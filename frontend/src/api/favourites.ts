import api from "./axios";
import { getToken } from "../utilites/auth";
import type { Product } from "../types/product";

export interface FavouriteItem {
  id: number;
  product: Product;
}

export const fetchFavourites = async (): Promise<FavouriteItem[]> => {
  const token = getToken();
  const res = await api.get<FavouriteItem[]>(`/favourite/`, { params: { token } });
  return res.data;
};

export const addFavourite = async (productId: number): Promise<number> => {
  const token = getToken();
  const res = await api.post<number>(`/favourite/add`, null, { params: { token, productId } });
  return res.data; // backend returns created favourite id
};

export const deleteFavourite = async (favouriteId: number): Promise<void> => {
  const token = getToken();
  await api.delete(`/favourite/delete/${favouriteId}`, { params: { token } });
};
