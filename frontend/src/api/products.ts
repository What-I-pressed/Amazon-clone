import type { Product } from "../types/product";
import type { Seller } from "../types/seller";
import api from "./axios";

const API_BASE = "/api/products";
const API_SELLER = "/api/seller";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/page/0?size=100`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Не вдалося отримати список товарів");
    const pageData = await res.json();
    return pageData.content || [];
  } catch (error) {
    console.error("[API] Помилка fetchProducts:", error);
    throw error;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  if (!slug) throw new Error("Slug товару не може бути пустим");
  try {
    const res = await fetch(`${API_BASE}/${slug}`);
    if (!res.ok) throw new Error(`Не вдалося отримати товар зі slug: ${slug}`);
    return res.json();
  } catch (error) {
    console.error(`[API] Помилка fetchProductBySlug (slug: ${slug}):`, error);
    throw error;
  }
}

export async function fetchSellerProfileBySlug(slug: string): Promise<Seller> {
  if (!slug) throw new Error("Slug продавця не може бути пустим");
  try {
    const res = await fetch(`${API_SELLER}/${slug}`);
    if (!res.ok) throw new Error(`Не вдалося отримати профіль продавця зі slug: ${slug}`);
    const data = await res.json();
    // адаптируем avatar/banner
    return {
      ...data,
      avatar: data.url ? `http://localhost:8080/${data.url}` : null,
      banner: data.banner ? `http://localhost:8080/${data.banner}` : null,
    };
  } catch (error) {
    console.error(`[API] Помилка fetchSellerProfileBySlug (slug: ${slug}):`, error);
    throw error;
  }
}

export async function fetchSellerProductsBySlug(
  slug: string,
  page = 0,
  size = 12
): Promise<{ content: Product[]; totalElements: number }> {
  if (!slug) throw new Error("Slug продавця не може бути пустим");
  try {
    const res = await fetch(`${API_BASE}/vendor/slug/${slug}?page=${page}&size=${size}`);
    if (!res.ok) throw new Error(`Не вдалося отримати товари продавця зі slug: ${slug}`);
    return res.json();
  } catch (error) {
    console.error(`[API] Помилка fetchSellerProductsBySlug (slug: ${slug}):`, error);
    throw error;
  }
}

// Best-effort fetch by numeric ID. Tries common patterns used in backends.
export async function fetchProductById(id: number): Promise<Product | null> {
  const candidates = [
    `${API_BASE}/id/${id}`,
    `${API_BASE}/${id}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data as Product;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export type CharacteristicInput = { characteristic: string; value: string };

// Create product for a seller using backend endpoint: POST /api/products/create/{sellerId}
export interface ProductCreationPayload {
  name: string;
  description?: string;
  price: number;
  priceWithoutDiscount: number;
  quantityInStock: number;
  categoryName: string;
  subcategoryName?: string;
  characteristicTypeName?: string;
  discountLaunchDate?: string; // ISO string
  discountExpirationDate?: string; // ISO string
  characteristics?: CharacteristicInput[]; // optional
  variations?: any[]; // optional
}

export async function createProductForSeller(
  sellerId: number,
  payload: ProductCreationPayload
): Promise<Product> {
  const body = { ...payload, sellerId };
  const res = await api.post<Product>(`/products/create/${sellerId}`, body);
  return res.data;
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Update product
export async function updateProduct(
  productId: number,
  payload: Partial<ProductCreationPayload>
): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE}/update/${productId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  } catch (e) {
    console.error("[API] updateProduct:", e);
    throw e;
  }
}

// Delete product
export async function deleteProduct(productId: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/delete/${productId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
  } catch (e) {
    console.error("[API] deleteProduct:", e);
    throw e;
  }
}

export type ProductFilterPayload = {
  name?: string | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  lowerPriceBound?: number | null;
  upperPriceBound?: number | null;
  sellerIds?: number[] | null;
  slugs?: string[] | null;
  characteristics?: Record<string, string> | null;
};

export type ProductPageResponse = {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const defaultFilterPayload: ProductFilterPayload = {
  name: null,
  categoryId: null,
  subcategoryId: null,
  lowerPriceBound: null,
  upperPriceBound: null,
  sellerIds: null,
  slugs: null,
  characteristics: null,
};

export async function fetchProductsPage(
  page = 0,
  size = 12,
  filters: ProductFilterPayload = {}
): Promise<ProductPageResponse> {
  const payload: ProductFilterPayload = {
    ...defaultFilterPayload,
    ...filters,
  };

  try {
    const res = await fetch(`${API_BASE}/page/${page}?size=${size}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to load products page");
    }

    return res.json();
  } catch (error) {
    console.error("[API] fetchProductsPage:", error);
    throw error;
  }
}
