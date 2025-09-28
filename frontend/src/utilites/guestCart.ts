const STORAGE_KEY = "guestCart";

export interface GuestCartProductSnapshot {
  id: number;
  slug?: string;
  name: string;
  price: number;
  priceLabel?: string;
  imageUrl?: string;
}

export interface GuestCartItem {
  productId: number;
  quantity: number;
  snapshot: GuestCartProductSnapshot;
}

const dispatchCartUpdated = () => {
  window.dispatchEvent(new CustomEvent("cart:updated"));
};

export const getGuestCart = (): GuestCartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity) || 0,
        snapshot: {
          id: Number(item?.snapshot?.id ?? item.productId),
          slug: typeof item?.snapshot?.slug === "string" ? item.snapshot.slug : undefined,
          name: String(item?.snapshot?.name ?? "Product"),
          price: Number(item?.snapshot?.price ?? 0) || 0,
          priceLabel: typeof item?.snapshot?.priceLabel === "string" ? item.snapshot.priceLabel : undefined,
          imageUrl: typeof item?.snapshot?.imageUrl === "string" ? item.snapshot.imageUrl : undefined,
        },
      }))
      .filter((item) => Number.isFinite(item.productId) && item.quantity > 0);
  } catch {
    return [];
  }
};

const persistCart = (items: GuestCartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const setGuestCart = (items: GuestCartItem[]) => {
  persistCart(items);
  dispatchCartUpdated();
};

export const addGuestCartItem = (nextItem: GuestCartItem) => {
  const items = getGuestCart();
  const existing = items.find((item) => item.productId === nextItem.productId);
  if (existing) {
    existing.quantity += nextItem.quantity;
    existing.snapshot = { ...existing.snapshot, ...nextItem.snapshot };
  } else {
    items.push(nextItem);
  }
  persistCart(items);
  dispatchCartUpdated();
};

export const updateGuestCartItemQuantity = (productId: number, quantity: number) => {
  const items = getGuestCart();
  const nextQuantity = Math.max(0, Math.floor(quantity));
  const next = items
    .map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
    .filter((item) => item.quantity > 0);
  persistCart(next);
  dispatchCartUpdated();
};

export const incrementGuestCartItem = (productId: number, delta: number) => {
  const items = getGuestCart();
  const next: GuestCartItem[] = [];
  let found = false;
  items.forEach((item) => {
    if (item.productId === productId) {
      found = true;
      const qty = Math.max(0, item.quantity + delta);
      if (qty > 0) {
        next.push({ ...item, quantity: qty });
      }
    } else {
      next.push(item);
    }
  });
  if (!found && delta > 0) {
    next.push({
      productId,
      quantity: delta,
      snapshot: { id: productId, name: "Product", price: 0 },
    });
  }
  persistCart(next);
  dispatchCartUpdated();
};

export const removeGuestCartItem = (productId: number) => {
  const items = getGuestCart().filter((item) => item.productId !== productId);
  persistCart(items);
  dispatchCartUpdated();
};

export const clearGuestCart = () => {
  localStorage.removeItem(STORAGE_KEY);
  dispatchCartUpdated();
};
