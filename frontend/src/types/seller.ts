import type { SellerStats } from "./sellerstats";

export type Seller = {
  id: number;
  username: string;
  email: string;
  description?: string;
  roleName?: string;
  createdAt?: string;
  blocked?: boolean;
  url?: string;       // avatar
  banner?: string;
  slug: string;       // добавляем slug
  rating?: number;
  stats?: SellerStats;
};
