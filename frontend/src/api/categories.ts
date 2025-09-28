import type { Category } from "../types/category";

export type CategorySummary = {
  name: string;
  subcategories: { id?: number; name: string }[];
};

const CATEGORY_LIST_ENDPOINT = "/api/characteristics/categories/";
const CATEGORY_API_BASE = "/api/categories";

// Отримати всі категорії
export async function fetchCategories(): Promise<CategorySummary[]> {
  try {
    const res = await fetch(CATEGORY_LIST_ENDPOINT);
    if (!res.ok) throw new Error("Не вдалося отримати категорії");

    const payload = await res.json();
    if (!payload || typeof payload !== "object") {
      return [];
    }

    return Object.entries(payload).map(([name, subcategories]) => ({
      name,
      subcategories: Array.isArray(subcategories)
        ? subcategories
            .map((sub: { id?: number; name?: string }) => {
              if (!sub?.name) return null;
              return sub.id ? { id: sub.id, name: sub.name } : { name: sub.name };
            })
            .filter((s): s is { id?: number; name: string } => Boolean(s))
        : [],
    }));
  } catch (error) {
    console.error("[API] Помилка fetchCategories:", error);
    throw error;
  }
}

// Отримати категорію за ID
export async function fetchCategoryById(id: string): Promise<Category> {
  try {
    const res = await fetch(`${CATEGORY_API_BASE}/${id}`);
    if (!res.ok) throw new Error("Не вдалося отримати категорію");
    return res.json();
  } catch (error) {
    console.error("[API] Помилка fetchCategoryById:", error);
    throw error;
  }
}

// Створити категорію
export async function createCategory(name: string): Promise<Category> {
  if (!name) {
    throw new Error("Назва категорії не може бути пустою");
  }
  try {
    const res = await fetch(CATEGORY_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      throw new Error("Не вдалося створити категорію");
    }
    return res.json();
  } catch (error) {
    console.error("[API] Помилка createCategory:", error);
    throw error;
  }
}

// Оновити категорію
export async function updateCategory(id: string, name: string): Promise<Category> {
  if (!name) {
    throw new Error("Назва категорії не може бути пустою");
  }
  try {
    const res = await fetch(`${CATEGORY_API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      throw new Error("Не вдалося оновити категорію");
    }
    return res.json();
  } catch (error) {
    console.error("[API] Помилка updateCategory:", error);
    throw error;
  }
}

// Видалити категорію
export async function deleteCategory(id: string): Promise<void> {
  try {
    const res = await fetch(`${CATEGORY_API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Не вдалося видалити категорію");
    }
  } catch (error) {
    console.error("[API] Помилка deleteCategory:", error);
    throw error;
  }
}