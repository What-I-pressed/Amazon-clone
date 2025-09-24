import type { Customer } from "../types/customer";

const API_BASE = "http://localhost:8080/api";

// helper для заголовків
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// отримання профілю покупця
export async function fetchCustomerProfile(): Promise<Customer> {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Не вдалося отримати профіль покупця");
    return res.json();
  } catch (e) {
    console.error("[API] fetchCustomerProfile:", e);
    throw e;
  }
}

// оновлення профілю покупця
export async function updateCustomerProfile(data: Partial<Customer>): Promise<Customer> {
  try {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Не вдалося оновити профіль покупця");
    return res.json();
  } catch (e) {
    console.error("[API] updateCustomerProfile:", e);
    throw e;
  }
}
