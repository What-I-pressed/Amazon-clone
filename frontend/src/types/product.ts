export type Picture = {
  id: number;
  name: string;
  url: string;
  pictureType: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  pictures: Picture[];
  createdAt: string;
  updatedAt: string;
  views: number;
  sold: number;
  rating?: number;       // optional
  slug: string;          // добавляем slug для посилань
  sellerSlug: string;
  reviewCount?: number;  // add reviewCount as optional
  priceWithoutDiscount?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
  discountLaunchDate?: string | null;
  discountExpirationDate?: string | null;
  quantityInStock?: number;
  quantitySold?: number;
  categoryName?: string;
  categoryId?: number;
  subcategoryName?: string;
  subcategoryId?: number;
  characteristicType?: string;
  sellerName?: string;
  sellerId?: number;
};
