export type User = {
  id: number;
  username: string;
  email: string;
  roleName?: string;
  description?: string;
  createdAt: string;
  blocked: boolean;
};