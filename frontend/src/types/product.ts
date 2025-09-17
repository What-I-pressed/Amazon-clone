export type Picture = {
  id: number;
  name: string;
  url: string;
  pictureType: string;
};

export type Product = {
  id: string;
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
};
