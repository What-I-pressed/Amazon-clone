import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCart, addToCart, removeFromCart, clearCart, type CartItemResponseDto } from "../api/cart";

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItemResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0);
  }, [items]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCart();
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося завантажити кошик");
    } finally {
      setLoading(false);
    }
  };

  // Commit a typed quantity for a specific cart line
  const commitQuantity = (productId: number, desired: number, current: number) => {
    const next = Math.max(1, desired | 0);
    const delta = next - current;
    if (delta !== 0) {
      changeQuantityDelta(productId, delta, current);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Local edit buffer for quantities, so users can type a number and commit on Enter/blur
  const [pendingQty, setPendingQty] = useState<Record<number, number>>({});

  const changeQuantityDelta = async (productId: number, delta: number, currentQty?: number) => {
    // If an explicit current quantity is provided, validate not going below 1
    if (typeof currentQty === 'number' && currentQty + delta < 1) return;
    if (delta === 0) return;
    try {
      setLoading(true);
      // Backend expects delta for /cart/add (increments by quantity)
      await addToCart({ productId, quantity: delta });
      // Reload to reflect server state
      await load();
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Не вдалося оновити кількість");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setLoading(true);
      await removeFromCart(cartItemId);
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося видалити товар");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      setLoading(true);
      await clearCart();
      setItems([]);
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося очистити кошик");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Кошик</h1>

      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 && !loading ? (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <div className="text-lg font-semibold mb-1">Ваш кошик порожній</div>
          <div className="text-gray-600 mb-4">Додайте товари до кошика, щоб продовжити оформлення</div>
          <a href="/catalog" className="inline-block px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800">Перейти в каталог</a>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border-gray-300 border hover:shadow-md transition-shadow"
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  padding: 16,
                  cursor: item.product?.slug ? "pointer" : "default",
                }}
                onClick={() => item.product?.slug && navigate(`/product/${item.product.slug}`)}
                role={item.product?.slug ? "button" : undefined}
                tabIndex={item.product?.slug ? 0 : undefined}
              >
                {/* Image */}
                {(() => {
                  const primary = item.product?.pictures?.find(p => (p as any)?.pictureType === 'PRIMARY') || item.product?.pictures?.[0];
                  const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : undefined;
                  return imgUrl ? (
                    <div style={{ width: 120, height: 120, borderRadius: 12, background: '#fff', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img
                        src={imgUrl}
                        alt={item.product?.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: 120, height: 120, background: '#f3f4f6', borderRadius: 12 }} />
                  );
                })()}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.product?.name}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>{item.product?.price?.toFixed(2)} грн</div>
                </div>

                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      const pid = Number((item.product as any)?.id);
                      if (Number.isFinite(pid)) changeQuantityDelta(pid, -1, item.quantity);
                    }}
                    disabled={loading || item.quantity <= 1}
                    style={{ width: 32, height: 32, borderRadius: 6 }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={pendingQty[item.id] ?? item.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = Number.parseInt(val, 10);
                      setPendingQty((m) => ({ ...m, [item.id]: Number.isFinite(parsed) ? parsed : 1 }));
                    }}
                    onBlur={() => {
                      const pid = Number((item.product as any)?.id);
                      if (!Number.isFinite(pid)) return;
                      const desired = pendingQty[item.id] ?? item.quantity;
                      commitQuantity(pid, desired, item.quantity);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const pid = Number((item.product as any)?.id);
                        if (!Number.isFinite(pid)) return;
                        const desired = pendingQty[item.id] ?? item.quantity;
                        commitQuantity(pid, desired, item.quantity);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 68, height: 32, padding: 4, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const pid = Number((item.product as any)?.id);
                      if (Number.isFinite(pid)) changeQuantityDelta(pid, +1, item.quantity);
                    }}
                    disabled={loading}
                    style={{ width: 32, height: 32, borderRadius: 6 }}
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} disabled={loading} style={{ marginLeft: 12 }}>
                  Видалити
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-xl mt-4 sticky bottom-4 p-4 border-gray-300 border">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Загальна сума: {total.toFixed(2)} грн</div>
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  disabled={loading || items.length === 0}
                  className="px-4 py-2 rounded-full border hover:bg-gray-50 disabled:opacity-50"
                >
                  Очистити кошик
                </button>
                <a href="/checkout">
                  <button
                    disabled={items.length === 0}
                    className="px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Перейти до оплати
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
