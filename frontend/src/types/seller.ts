import type { SellerStats } from "./sellerstats";

export type Seller = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating?: number;
  description?: string;
  stats?: SellerStats;
};