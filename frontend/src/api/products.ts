import type { Product } from "../types/product";

const API_BASE = "/api/products";

export async function fetchProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_BASE}/page/0?size=100`);
        if (!res.ok) {
            throw new Error("Не вдалося отримати список товарів");
        }
        const pageData = await res.json();
        return pageData.content || [];
    } catch (error) {
        console.error("[API] Помилка fetchProducts:", error);
        throw error;
    }
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
    if (!slug) {
        throw new Error("Slug товару не може бути пустим");
    }

    try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`);
        if (!res.ok) {
            throw new Error(`Не вдалося отримати товар з slug: ${slug}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API] Помилка fetchProductBySlug (slug: ${slug}):`, error);
        throw error;
    }
}

// Keep ID-based function for admin/private operations
export async function fetchProductById(id: string): Promise<Product> {
    if (!id) {
        throw new Error("Ідентифікатор товару не може бути пустим");
    }

    try {
        const res = await fetch(`${API_BASE}/id/${id}`);
        if (!res.ok) {
            throw new Error(`Не вдалося отримати товар з id: ${id}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API] Помилка fetchProductById (id: ${id}):`, error);
        throw error;
    }
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
    if (!data.name || !data.price) {
        throw new Error("Назва та ціна товару обов'язкові");
    }

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error("Не вдалося створити товар");
        }

        return res.json();
    } catch (error) {
        console.error("[API] Помилка createProduct:", error);
        throw error;
    }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    if (!id) {
        throw new Error("Ідентифікатор товару не може бути пустим");
    }
    if (!data) {
        throw new Error("Дані для оновлення товару відсутні");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Не вдалося оновити товар з id: ${id}`);
        }

        return res.json();
    } catch (error) {
        console.error(`[API] Помилка updateProduct (id: ${id}):`, error);
        throw error;
    }
}

export async function deleteProduct(id: string): Promise<void> {
    if (!id) {
        throw new Error("Ідентифікатор товару не може бути пустим");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            throw new Error(`Не вдалося видалити товар з id: ${id}`);
        }
    } catch (error) {
        console.error(`[API] Помилка deleteProduct (id: ${id}):`, error);
        throw error;
    }
}

export const fetchSellerProducts = async (slug: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/sellers/${slug}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Доступ заборонено");
        } else if (response.status === 404) {
          throw new Error("Продавець не знайдений");
        } else {
          throw new Error(`Помилка: ${response.status}`);
        }
      }
  
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Помилка при fetchSellerProducts:", err);
      throw err;
    }
  };
  

  