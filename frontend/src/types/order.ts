export type OrderStatus = "NEW" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "CONFIRMED";

export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    totalPrice: number;
    product?: {
        id: number;
        name: string;
        seller?: {
            id: number;
            name: string;
        };
        sellerId?: number;
    };
}

export interface Order {
    id: number;
    userId?: number;
    buyerId?: number;
    totalPrice: number;
    orderStatus: OrderStatus;
    orderDate: string;
    arrivalDate?: string | null;
    shipmentDate?: string | null;
    orderItems: OrderItem[];
    buyer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

// Legacy interface for backward compatibility
export interface LegacyOrder {
    id: string;
    productId: string;
    buyerId: string;
    quantity: number;
    status: OrderStatus;   
    createdAt: string;
    updatedAt?: string;
}
