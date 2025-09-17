import type { Product } from "../types/product";
import type { Seller } from "../types/seller";

const API_BASE = "/api/products";
const API_SELLER = "/api/seller";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/page/0?size=100`);
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
