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
