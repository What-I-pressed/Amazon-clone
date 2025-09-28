import api from "./axios";
import type { ProductFilterDto } from "./search";

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

// POST-based custom characteristics lookup accepting ProductFilterDto
// Returns: { [characteristicTypeName]: string[] }
export async function getCustomCharacteristics(filter: Pick<ProductFilterDto, "name" | "categoryId" | "subcategoryId">): Promise<Record<string, string[]>> {
  const res = await api.post<Record<string, string[]>>("/characteristics/custom", filter);
  return res.data;
}

// More resilient variant: try alternative URL with trailing slash, then GET by subcategory if available.
export async function getCustomCharacteristicsResilient(filter: Pick<ProductFilterDto, "name" | "categoryId" | "subcategoryId">): Promise<Record<string, string[]>> {
  try {
    return await getCustomCharacteristics(filter);
  } catch (e) {
    try {
      const res2 = await api.post<Record<string, string[]>>("/characteristics/custom/", filter);
      return res2.data;
    } catch (e2) {
      if (filter.subcategoryId != null) {
        try {
          return await getCharacteristicsBySubcategory(filter.subcategoryId);
        } catch (e3) {
          // noop, will fall through
        }
      }
      throw e2;
    }
  }
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
