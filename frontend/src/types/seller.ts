import type { SellerStats } from "./sellerstats";

export type Seller = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  banner?: string;
  rating?: number;
  description?: string;
  stats?: SellerStats;
};