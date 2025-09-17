import type { SellerStats } from "./sellerstats";

export type Seller = {
  id: number;
  slug: string;
  username: string;
  email: string;
  description?: string;
  roleName?: string;
  createdAt?: string;
  blocked?: boolean;
  avatar?: string;
  banner?: string;
  rating?: number;
  stats?: SellerStats;
};