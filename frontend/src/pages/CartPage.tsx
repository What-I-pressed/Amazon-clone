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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen">
        <div className="text-center py-8">
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen">
        <div className="border rounded-2xl p-10 text-center">
          <div className="text-lg font-semibold mb-1">Ваш кошик порожній</div>
          <div className="text-gray-600 mb-4">Додайте товари до кошика, щоб продовжити оформлення</div>
          <a href="/catalog" className="inline-block px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800">Перейти в каталог</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="flex gap-8">
        {/* Left side - Product Table */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-400 text-white">
              <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm font-medium">
                <div>Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {error && (
                <div className="px-6 py-4">
                  <p className="text-red-500">{error}</p>
                </div>
              )}
              
              {items.map((item) => {
                const itemTotal = (item.product?.price || 0) * item.quantity;
                return (
                  <div key={item.id} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50">
                    {/* Product */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 text-lg font-bold w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                      
                      {(() => {
                        const primary = item.product?.pictures?.find(p => (p as any)?.pictureType === 'PRIMARY') || item.product?.pictures?.[0];
                        const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : undefined;
                        return imgUrl ? (
                          <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0" />
                        );
                      })()}
                      
                      <div 
                        className="min-w-0 cursor-pointer"
                        onClick={() => item.product?.slug && navigate(`/product/${item.product.slug}`)}
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name || 'Product Name'}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-900">
                        ${(item.product?.price || 0).toFixed(0)}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => {
                            const pid = Number((item.product as any)?.id);
                            if (Number.isFinite(pid)) changeQuantityDelta(pid, -1, item.quantity);
                          }}
                          disabled={loading || item.quantity <= 1}
                          className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          −
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
                          className="w-12 px-2 py-1 text-center text-sm border-0 focus:outline-none"
                        />
                        
                        <button
                          onClick={() => {
                            const pid = Number((item.product as any)?.id);
                            if (Number.isFinite(pid)) changeQuantityDelta(pid, +1, item.quantity);
                          }}
                          disabled={loading}
                          className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900">
                        ${itemTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side - Cart Total */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-400 text-white px-6 py-3">
              <h3 className="text-sm font-medium">Cart Total</h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">SUBTOTAL</span>
                <span className="text-sm font-medium">${total.toFixed(0)}</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">DISCOUNT</span>
                <span className="text-sm text-gray-400">—</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center py-2 font-semibold">
                <span className="text-sm">TOTAL</span>
                <span className="text-sm">${total.toFixed(0)}</span>
              </div>

              <div className="pt-4">
                <a href="/checkout" className="block">
                  <button
                    disabled={items.length === 0}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed To Checkout
                  </button>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={clearAll}
                  disabled={loading || items.length === 0}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;