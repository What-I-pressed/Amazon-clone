// api/seller.ts
import type { Seller } from "../types/seller";
import type { SellerStats } from "../types/sellerstats";
import type { Product } from "../types/product";
import type { PageResponse } from "../types/pageresponse";

const API_BASE = "http://localhost:8080/api/seller";

// Helper для заголовків авторизації
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// === Приватний seller profile ===
export async function fetchSellerProfile(): Promise<Seller> {
  const res = await fetch(`${API_BASE}/profile`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Не вдалося отримати профіль продавця");
  return res.json();
}

// === Приватні товари продавця ===
export async function fetchMySellerProducts(
  page = 0,
  size = 24
): Promise<PageResponse<Product>> {
  const res = await fetch(`${API_BASE}/profile/products/${page}?size=${size}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Не вдалося отримати товари продавця");
  return res.json();
}

// === Приватна статистика ===
export async function fetchSellerStats(): Promise<SellerStats> {
  const res = await fetch(`${API_BASE}/profile/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Не вдалося отримати статистику продавця");
  return res.json();
}

// === Приватне оновлення профілю ===
export async function updateSellerProfile(data: Partial<Seller>): Promise<Seller> {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Не вдалося оновити профіль продавця");
  return res.json();
}

// === Public endpoints ===

export async function fetchPublicSellerProfileBySlug(slug: string): Promise<Seller> {
  try {
    const res = await fetch(`http://localhost:8080/api/sellers/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error("Не вдалося отримати публічний профіль продавця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchPublicSellerProfileBySlug:", e);
    throw e;
  }
}

// get public seller products by slug (paginated)
export async function fetchPublicSellerProductsBySlug(
  slug: string,
  page = 0,
  size = 12
): Promise<PageResponse<Product>> {
  try {
    const res = await fetch(
      `${"http://localhost:8080/api/products/public/vendor"}/${encodeURIComponent(slug)}?page=${page}&size=${size}`
    );
    if (!res.ok) throw new Error("Не вдалося отримати товари продавця");
    const data = await res.json();

    // normalize response
    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      size: data.size,
      currentPage: page,
    };
  } catch (e) {
    console.error("[API] fetchPublicSellerProductsBySlug:", e);
    throw e;
  }
}