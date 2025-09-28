import api from "./axios";

export async function uploadProductPicture(productId: number, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("ProductId", String(productId));
  const res = await api.post<string>(`/pictures/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function uploadSellerAvatar(sellerId: number, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("SellerId", String(sellerId));
  const res = await api.post<string>(`/pictures/upload/seller/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function uploadUserAvatar(userId: number, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("UserId", String(userId));
  const res = await api.post<string>(`/pictures/upload/user/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
