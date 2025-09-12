// api/seller.ts
import type { Seller } from "../types/seller";
import type { SellerStats } from "../types/sellerstats";
import type { Product } from "../types/product";

const API_BASE = "http://localhost:8080/api/seller";

// helper для заголовків
function getAuthHeaders() {
  const token = localStorage.getItem("token"); // або з cookies/sessionStorage
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// отримання профілю продавця
export async function fetchSellerProfile(): Promise<Seller> {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
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
    const res = await fetch(`${API_BASE}/profile`, {
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
    const res = await fetch(`${API_BASE}/profile/stats`, {
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

export async function fetchSellerProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/profile/products`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Не вдалося отримати товари продавця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchSellerProducts:", e);
    throw e;
  }
}