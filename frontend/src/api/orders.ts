import type { Order } from "../types/order";

const API_BASE = "/api/orders";

export async function fetchOrders(): Promise<Order[]> {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) {
            throw new Error("Не вдалося отримати список замовлень");
        }
        return res.json();
    } catch (error) {
        console.error("[API] Помилка fetchOrders:", error);
        throw error;
    }
}

export async function fetchOrderById(id: string): Promise<Order> {
    if (!id) {
        throw new Error("Ідентифікатор замовлення не може бути пустим");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) {
            throw new Error(`Не вдалося отримати замовлення з id: ${id}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[API] Помилка fetchOrderById (id: ${id}):`, error);
        throw error;
    }
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    if (!id) {
        throw new Error("Ідентифікатор замовлення не може бути пустим");
    }
    if (!data) {
        throw new Error("Дані для оновлення замовлення відсутні");
    }

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Не вдалося оновити замовлення з id: ${id}`);
        }

        return res.json();
    } catch (error) {
        console.error(`[API] Помилка updateOrder (id: ${id}):`, error);
        throw error;
    }
}
