import { addToCart } from "../api/cart";
import { clearGuestCart, getGuestCart } from "../utilites/guestCart";

/**
 * Merge guest cart stored in localStorage into the authenticated user cart.
 * Returns true when a merge was performed (guest cart had items), false otherwise.
 */
export const mergeGuestCartWithServer = async (): Promise<boolean> => {
  const guestItems = getGuestCart();
  if (!guestItems.length) {
    return false;
  }

  for (const item of guestItems) {
    if (!Number.isFinite(item.productId) || item.quantity <= 0) {
      continue;
    }
    await addToCart({
      productId: item.productId,
      quantity: item.quantity,
    });
  }

  clearGuestCart();
  return true;
};
