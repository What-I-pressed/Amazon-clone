import React, { useEffect, useState } from "react";
import { fetchSellerOrders } from "../../api/orders";
import { fetchProductById } from "../../api/products";
import { fetchSellerProfile } from "../../api/seller";

const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profile, data] = await Promise.all([
          fetchSellerProfile().catch(() => null),
          fetchSellerOrders()
        ]);
        if (profile && typeof profile.id === 'number') setSellerId(profile.id);
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.response?.data || e?.message || "Не вдалося завантажити замовлення продавця");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [productMap, setProductMap] = useState<Record<number, any>>({});

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);

    const rawIds: number[] = Array.isArray(order?.orderItems)
      ? order.orderItems.map((it: any) => Number(it?.productId || it?.product?.id))
      : [];
    const ids: number[] = Array.from(new Set(rawIds.filter((n: number) => Number.isFinite(n))));
    if (ids.length === 0) {
      setProductMap({});
      return;
    }
    Promise.all(ids.map(async (id: number) => ({ id, product: await fetchProductById(id) })))
      .then((entries) => {
        const next: Record<number, any> = {};
        for (const { id, product } of entries) {
          if (product) next[id] = product;
        }
        setProductMap(next);
      })
      .catch(() => setProductMap({}));
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
    setProductMap({});
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Замовлення моїх товарів</h1>
      {loading && <p>Завантаження...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && orders.length === 0 && <p>Поки немає замовлень на ваші товари.</p>}

      <div className="space-y-4">
        {orders.map((order: any) => {
          const items: any[] = Array.isArray(order?.orderItems) ? order.orderItems : [];
          // Try to compute seller-specific total when seller info is present on items
          let sellerTotal: number | undefined = undefined;
          if (sellerId != null) {
            const sumOwned = items
              .filter((it: any) => {
                const sellerInItem = it?.product?.seller?.id ?? it?.product?.sellerId;
                return typeof sellerInItem === 'number' && Number(sellerInItem) === Number(sellerId);
              })
              .reduce((acc: number, it: any) => acc + Number(it?.totalPrice || 0), 0);
            if (Number.isFinite(sumOwned) && sumOwned > 0) sellerTotal = sumOwned;
          }
          const orderTotal = typeof sellerTotal === 'number'
            ? sellerTotal
            : (typeof order?.totalPrice === 'number' ? order.totalPrice
              : (typeof order?.price === 'number' ? order.price
                : items.reduce((acc: number, it: any) => acc + Number(it?.totalPrice || 0), 0)));
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border p-5 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              onClick={() => openDetails(order)}
              role="button"
              tabIndex={0}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">ID: {order.id}</div>
                {(() => {
                  const statusValue = order?.orderStatus?.name || order?.orderStatus || order?.status || 'NEW';
                  const s = String(statusValue).toUpperCase();
                  const styles: Record<string, string> = {
                    NEW: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
                    PROCESSING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
                    SHIPPED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
                    DELIVERED: 'bg-green-50 text-green-700 ring-1 ring-green-200',
                    CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
                    CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  };
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[s] || 'bg-gray-100 text-gray-700'}`}>
                      {s}
                    </span>
                  );
                })()}
              </div>
              {order.orderDate && (
                <div className="text-sm text-gray-500 mt-1">
                  Дата створення: {new Date(order.orderDate).toLocaleString()}
                </div>
              )}
              <div className="mt-2 font-semibold">
                {typeof sellerTotal === 'number' ? 'Сума для ваших товарів: ' : 'Сума замовлення: '}
                {Number(orderTotal).toFixed(2)} грн
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Товарів у замовленні: {items.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Деталі замовлення</h3>
              <button onClick={closeDetails} className="px-3 py-1 rounded hover:bg-gray-100">Закрити</button>
            </div>
            <div className="p-4 space-y-4">
              {selectedOrder?.error && (
                <p className="text-red-500">{selectedOrder.error}</p>
              )}
              {selectedOrder && !selectedOrder.error && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">ID: {selectedOrder.id}</div>
                  {selectedOrder.orderStatus && (
                    <div className="text-sm">Статус: {selectedOrder?.orderStatus?.name || selectedOrder.orderStatus}</div>
                  )}
                  {selectedOrder.orderDate && (
                    <div className="text-sm">Створено: {new Date(selectedOrder.orderDate).toLocaleString()}</div>
                  )}
                  {(() => {
                    const total = typeof selectedOrder.totalPrice === 'number' ? selectedOrder.totalPrice : (typeof selectedOrder.price === 'number' ? selectedOrder.price : undefined);
                    return typeof total === 'number' ? (
                      <div className="font-semibold">Сума (всього): {Number(total).toFixed(2)} грн</div>
                    ) : null;
                  })()}

                  {Array.isArray(selectedOrder.orderItems) && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Товари в замовленні</div>
                      <ul className="divide-y">
                        {(() => {
                          const allItems = selectedOrder.orderItems as any[];
                          const filtered = allItems.filter((it: any) => {
                            const sellerInItem = it?.product?.seller?.id ?? it?.product?.sellerId;
                            return sellerId != null && typeof sellerInItem === 'number' && Number(sellerInItem) === Number(sellerId);
                          });
                          const itemsToShow = filtered.length > 0 ? filtered : allItems;
                          return itemsToShow.map((it: any, idx: number) => (
                          <li key={idx} className="py-3 flex items-start justify-between gap-6">
                            <div className="min-w-0 flex items-center gap-4">
                              {/* image */}
                              {(() => {
                                const prodId = Number(it?.productId || it?.product?.id);
                                const prod = Number.isFinite(prodId) ? productMap[prodId] : undefined;
                                const primary = prod?.pictures?.find((p: any) => p?.pictureType === 'PRIMARY') || prod?.pictures?.[0];
                                const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : undefined;
                                return imgUrl ? (
                                  <img src={imgUrl} alt={prod?.name || `Товар #${prodId ?? idx+1}`}
                                       className="w-16 h-16 object-contain rounded bg-gray-50" />
                                ) : (
                                  <div className="w-16 h-16 rounded bg-gray-100" />
                                );
                              })()}
                              <div className="min-w-0">
                                <div className="font-medium truncate text-base">
                                  {(() => {
                                    const prodId = Number(it?.productId || it?.product?.id);
                                    return productMap[prodId]?.name || `Товар #${prodId ?? idx+1}`;
                                  })()}
                                </div>
                                {typeof it?.totalPrice === 'number' && (
                                  <div className="text-sm text-gray-600">Сума позиції: {Number(it.totalPrice).toFixed(2)} грн</div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-nowrap">x{Number(it?.quantity || 0)}</div>
                          </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button onClick={closeDetails} className="px-4 py-2 rounded border hover:bg-gray-50">Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
