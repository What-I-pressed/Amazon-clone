import React, { useEffect, useMemo, useState } from "react";
import { fetchCart, addToCart, removeFromCart, clearCart, type CartItemResponseDto } from "../api/cart";

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItemResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      setLoading(true);
      await addToCart({ productId, quantity });
      // Reload to reflect server state
      await load();
    } catch (e: any) {
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
        <p>Ваш кошик порожній</p>
      ) : (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: 12,
                }}
              >
                {/* Image */}
                {item.product?.pictures?.[0]?.url ? (
                  <img
                    src={item.product.pictures[0].url}
                    alt={item.product.name}
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, background: "#f3f4f6", borderRadius: 8 }} />
                )}

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                  <div style={{ color: "#6b7280" }}>{item.product?.price?.toFixed(2)} грн</div>
                </div>

                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQuantity(Number(item.product.id), item.quantity - 1)} disabled={loading || item.quantity <= 1}>
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(Number(item.product.id), parseInt(e.target.value) || 1)}
                    style={{ width: 60 }}
                  />
                  <button onClick={() => updateQuantity(Number(item.product.id), item.quantity + 1)} disabled={loading}>
                    +
                  </button>
                </div>

                {/* Remove */}
                <button onClick={() => removeItem(item.id)} disabled={loading} style={{ marginLeft: 12 }}>
                  Видалити
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <h2>Загальна сума: {total.toFixed(2)} $</h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={clearAll} disabled={loading || items.length === 0}>Очистити кошик</button>
              <a href="/checkout">
                <button disabled={items.length === 0}>Перейти до оплати</button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
