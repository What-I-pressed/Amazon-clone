import api from "./axios";

export interface SubcategoryDto {
  id: number;
  name: string;
}

export type CategoriesResponse = Record<string, SubcategoryDto[]>; // key = Category name, value = subcategories

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await api.get<CategoriesResponse>("/characteristics/categories/");
  return res.data;
}

// Returns: { [characteristicTypeName]: string[] }
export async function getCharacteristicsBySubcategory(subcategoryId: number): Promise<Record<string, string[]>> {
  const res = await api.get<Record<string, string[]>>("/characteristics/custom", {
    params: { subcategoryId },
  });
  return res.data;
}

export interface SellerShort {
  id: number;
  name: string;
  slug?: string;
}

export async function getSellersBySubcategory(subcategoryId: number): Promise<SellerShort[]> {
  const res = await api.get<SellerShort[]>("/characteristics/sellers/", {
    params: { subcategoryId },
  });
  return res.data;
}
