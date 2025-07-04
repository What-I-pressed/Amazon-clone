export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    createdAt: string;
    updatedAt: string; // Дата оновлення (опціонально)
    views: number;
    sold: number;
}
