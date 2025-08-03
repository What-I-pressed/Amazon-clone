export type Role = "user" | "seller" | "admin";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  shopName?: string;
  adminCode?: string;
}

export async function register(data: RegisterPayload) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }
  return res.json();
}
