export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    createdAt: string;
    updatedAt: string;
    views: number;
    sold: number;
    rating?: number; // optional
  };
  