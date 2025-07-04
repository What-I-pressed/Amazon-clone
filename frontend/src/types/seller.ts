export interface SellerStats {
    productsCount: number;   // Кількість товарів продавця
    ordersCount: number;     // Кількість замовлень
    totalViews: number;      // Загальна кількість переглядів товарів (Не знаю чи треба)
}

export interface Seller {
    id: string;
    name: string;
    email: string;
    avatar: string;         // URL аватарки
    rating: number;         // Рейтинг (від 0 до 5)
    stats: SellerStats;     // Статистика продавця
    description?: string;
}
