export type SellerStats = {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgFeedback: number;
  reviewsCount: number;
  salesWeekly?: { labels: string[]; data: number[] };
  salesMonthly?: { labels: string[]; data: number[] };
  salesYearly?: { labels: string[]; data: number[] };
};
