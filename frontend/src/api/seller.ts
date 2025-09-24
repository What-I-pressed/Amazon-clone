// api/seller.ts
import type { Seller } from "../types/seller";
import type { SellerStats } from "../types/sellerstats";
import type { Product } from "../types/product";
import type { PageResponse} from "../types/pageresponse";

const API_BASE = "http://localhost:8080/api";

// helper для заголовків
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// отримання профілю продавця
export async function fetchSellerProfile(): Promise<Seller> {
  try {
    const res = await fetch(`${API_BASE}/seller/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Не вдалося отримати профіль продавця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchSellerProfile:", e);
    throw e;
  }
}

// оновлення профілю продавця
export async function updateSellerProfile(data: Partial<Seller>): Promise<Seller> {
  try {
    const res = await fetch(`${API_BASE}/seller/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Не вдалося оновити профіль продавця");
    return res.json();
  } catch (e) {
    console.error("[API] updateSellerProfile:", e);
    throw e;
  }
}

// отримання статистики продавця
export async function fetchSellerStats(): Promise<SellerStats> {
  try {
    const res = await fetch(`${API_BASE}/seller/profile/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Не вдалося отримати статистику продавця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchSellerStats:", e);
    throw e;
  }
}

export async function fetchSellerProducts(
  sellerId: number,
  page = 0,
  size = 24
): Promise<PageResponse<Product>> {
  try {
    const res = await fetch(
      `${API_BASE}/seller/profile/products/${page}?sellerId=${sellerId}&size=${size}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) throw new Error("Не вдалося отримати товари продавця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchSellerProducts:", e);
    throw e;
  }
}

export async function fetchSellerProductsBySlug(
  slug: string,
  page = 0,
  size = 24
): Promise<PageResponse<Product>> {
  const res = await fetch(`${API_BASE}/products/page/${page}?size=${size}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slugs: [slug], // фільтрація по слагу
    }),
  });

  if (!res.ok) {
    throw new Error(`Не вдалося отримати товари продавця (slug=${slug})`);
  }

  return res.json();
}

export async function fetchSellerProfileBySlug(slug: string): Promise<Seller> {
  const res = await fetch(`${API_BASE}/seller/${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load seller profile for slug ${slug}`);
  }

  return res.json();
}
