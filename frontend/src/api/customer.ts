import type { Customer } from "../types/customer";

const API_BASE = "/api";

function ensureToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Користувач не авторизований");
  }
  return token;
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export interface UpdateCustomerProfilePayload {
  username: string;
  name?: string;
  description?: string;
  phone?: string;
}

// отримання профілю покупця
export async function fetchCustomerProfile(): Promise<Customer> {
  try {
    const token = ensureToken();
    const res = await fetch(`${API_BASE}/user/profile?token=${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error("Не вдалося отримати профіль покупця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchCustomerProfile:", e);
    throw e;
  }
}

// оновлення профілю покупця
export async function updateCustomerProfile(data: UpdateCustomerProfilePayload): Promise<Customer> {
  try {
    const token = ensureToken();
    const res = await fetch(`${API_BASE}/user/profile?token=${encodeURIComponent(token)}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Не вдалося оновити профіль покупця");
    return res.json();
  } catch (e) {
    console.error("[API] updateCustomerProfile:", e);
    throw e;
  }
}
