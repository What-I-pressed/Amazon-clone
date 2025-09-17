export type Review = {
  id: number;
  description: string;
  stars: number;
  date: string;
  username?: string;
  userId?: number;
};

const API_BASE = "http://localhost:8080/api/reviews";


export async function fetchProductReviews(productId: string | number): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/product/${productId}`);
  if (!res.ok) throw new Error("Failed to load product reviews");
  return res.json();
}

export async function createReview(input: {
  productId: string | number;
  description: string;
  stars: number;
  date?: string;
}): Promise<Review> {
  const body = {
    description: input.description,
    stars: input.stars,
    date: input.date ?? new Date().toISOString(),
    productId: typeof input.productId === 'string' ? parseInt(input.productId, 10) : input.productId,
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required to post a review');
  }
  const res = await fetch(`${API_BASE}/create?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

export async function deleteReview(reviewId: number): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required to delete a review');
  }
  const res = await fetch(`${API_BASE}/${reviewId}?token=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
  if (!(res.status === 204 || res.ok)) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to delete review');
  }
}
