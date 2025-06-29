import type { Seller } from "../types/seller";

const API_BASE = "/api/sellers";

export async function fetchSellerProfile(id: string | undefined): Promise<Seller> {
    if (!id) {
        throw new Error("Ідентифікатор продавця не може бути пустим");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) {
            throw new Error(`Не вдалося отримати профіль продавця з id: ${id}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API] Помилка fetchSellerProfile (id: ${id}):`, error);
        throw error;
    }
}

export async function updateSellerProfile(id: string, data: Partial<Seller>): Promise<Seller> {
    if (!id) {
        throw new Error("Ідентифікатор продавця не може бути пустим");
    }
    if (!data) {
        throw new Error("Дані для оновлення профілю відсутні");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Не вдалося оновити профіль продавця з id: ${id}`);
        }

        return res.json();
    } catch (error) {
        console.error(`[API] Помилка updateSellerProfile (id: ${id}):`, error);
        throw error;
    }
}
