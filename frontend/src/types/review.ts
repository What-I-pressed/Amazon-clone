export type Review = {
    id: number;
    description: string;
    stars: number;
    date: string;
    username?: string;
    userId?: number;
    parentId?: number;  
    productId?: number;
    roleName?: string;
    replies?: Review[];
  };