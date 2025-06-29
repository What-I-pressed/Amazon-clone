export type OrderStatus = "active" | "completed" | "cancelled";

export interface Order {
    id: string;
    productId: string;
    buyerId: string;
    quantity: number;
    status: OrderStatus;   
    createdAt: string;
    updatedAt?: string;     // Дата оновлення (опціонально)
}
