import { Review } from "../types/review";

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

export async function replyReview(input: {
  parentId: number;  // Changed from parentReviewId
  description: string;
  date?: string;
}): Promise<Review> {
  const body = {
    parentId: input.parentId,  // Changed from parentReviewId
    description: input.description,
    date: input.date ?? new Date().toISOString(),
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Authentication required to reply to a review');
  }

  const res = await fetch(`${API_BASE}/reply?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to reply to review');
  }

  return res.json();
}
