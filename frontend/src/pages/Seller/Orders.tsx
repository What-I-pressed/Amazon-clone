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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
        </div>

        {loading && <p className="text-center py-8">Завантаження...</p>}
        {error && <p className="text-red-500 text-center py-8">{error}</p>}
        {!loading && orders.length === 0 && (
          <p className="text-center py-8 text-gray-500">Поки немає замовлень на ваші товари.</p>
        )}

        {!loading && orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-400 px-6 py-4">
              <div className="grid grid-cols-6 gap-4 text-white font-medium">
                <div>Order no</div>
                <div>Items</div>
                <div>Status</div>
                <div>Tracking ID</div>
                <div>Delivery Date</div>
                <div className="text-right">Price</div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {orders.map((order: any) => {
                const items: any[] = Array.isArray(order?.orderItems) ? order.orderItems : [];
                
                // Calculate seller-specific total
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

                const statusValue = order?.orderStatus?.name || order?.orderStatus || order?.status || 'NEW';
                const statusText = String(statusValue).toUpperCase();
                
                // Get first item for display
                const firstItem = items[0];
                const prodId = Number(firstItem?.productId || firstItem?.product?.id);
                
                return (
                  <div
                    key={order.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetails(order)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Order Number */}
                      <div className="font-medium text-gray-900">
                        {order.id}
                      </div>

                      {/* Items */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          <div className="w-8 h-6 bg-gray-300 rounded"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Kitchen Bar Stool (Set Of 2)
                          </div>
                          {items.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{items.length - 1} more items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          In Progress
                        </span>
                      </div>

                      {/* Tracking ID */}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900">2176413876</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>

                      {/* Delivery Date */}
                      <div className="text-sm text-gray-600">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                      </div>

                      {/* Price */}
                      <div className="text-right font-medium text-gray-900">
                        ${Number(orderTotal).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
    </div>
  );
};

export default SellerOrdersPage;