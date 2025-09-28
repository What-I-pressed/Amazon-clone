import type { Order } from "../types/order";
import api from "./axios";
import { getToken } from "../utilites/auth";

const API_BASE = "/api/orders";

// Create order using backend OrderController
export interface OrderItemCreationDto {
  productId: number;
  quantity: number;
}

// Get all orders for the current user
export async function fetchUserOrders(): Promise<any[]> {
  const token = getToken();
  const res = await api.get(`/orders/all`, { params: { token } });
  // Controller returns 204 No Content for empty -> axios throws? We'll normalize to []
  // But axios resolves 204 with empty data, so fallback
  return Array.isArray(res.data) ? res.data : [];
}

export interface OrderCreationDto {
  orderItems: OrderItemCreationDto[];
}

export async function createOrder(payload: OrderCreationDto): Promise<any> {
  const token = getToken();
  const res = await api.put(`/orders/create`, payload, { params: { token } });
  return res.data;
}

// Get orders that include items of the current seller
export async function fetchSellerOrders(): Promise<any[]> {
  const token = getToken();
  const res = await api.get(`/orders/seller/orders`, { params: { token } });
  return Array.isArray(res.data) ? res.data : [];
}

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

// Admin-specific API functions
export async function fetchAllOrdersAdmin(): Promise<Order[]> {
    const token = getToken();
    const res = await api.get("/orders/not-completed", { params: { token } });
    return Array.isArray(res.data) ? res.data : [];
}

export async function fetchCompletedOrders(): Promise<Order[]> {
    const token = getToken();
    const res = await api.get("/orders/completed", { params: { token } });
    return Array.isArray(res.data) ? res.data : [];
}

export async function fetchActiveOrders(): Promise<Order[]> {
    const token = getToken();
    const res = await api.get("/orders/active", { params: { token } });
    return Array.isArray(res.data) ? res.data : [];
}

// Order status update functions
export async function setOrderStatusProcessing(orderId: number): Promise<void> {
    const token = getToken();
    await api.put(`/orders/status/process`, null, { params: { token, orderId } });
}

export async function setOrderStatusShipped(orderId: number): Promise<void> {
    const token = getToken();
    await api.put(`/orders/status/ship`, null, { params: { token, orderId } });
}

export async function setOrderStatusDelivered(orderId: number): Promise<void> {
    const token = getToken();
    await api.put(`/orders/status/deliver`, null, { params: { token, orderId } });
}

export async function confirmOrder(orderId: number): Promise<void> {
    const token = getToken();
    await api.put(`/orders/status/confirm`, null, { params: { token, orderId } });
}

export async function cancelOrder(orderId: number): Promise<void> {
    const token = getToken();
    await api.put(`/orders/status/cancel`, null, { params: { token, orderId } });
}

export async function updateOrderAdmin(orderId: number, data: Partial<Order>): Promise<Order> {
    const token = getToken();
    const res = await api.put(`/orders/${orderId}`, data, { params: { token } });
    return res.data;
}

export async function fetchOrderByIdAdmin(orderId: number): Promise<Order> {
    const token = getToken();
    const res = await api.get(`/orders/${orderId}`, { params: { token } });
    return res.data;
}
