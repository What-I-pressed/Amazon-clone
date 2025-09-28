import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../api/orders";
import { fetchProductById } from "../api/products";
import { AuthContext } from "../context/AuthContext";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("OrdersPage must be used within AuthProvider");

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserOrders();
        setOrders(data || []);
      } catch (e: any) {
        setError(e?.response?.data || e?.message || "Не вдалося завантажити замовлення");
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) load();
  }, [auth.loading, auth.isAuthenticated, navigate]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [productMap, setProductMap] = useState<Record<number, any>>({});
  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
    const rawIds: number[] = Array.isArray(order?.orderItems)
      ? order.orderItems.map((it: any) => Number(it?.productId))
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

  const formatStatus = (status: string) => {
    const s = String(status || 'NEW').toUpperCase();
    switch (s) {
      case 'NEW': return 'In Progress';
      case 'PROCESSING': return 'In Progress';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return 'In Progress';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const s = String(status || 'NEW').toUpperCase();
    switch (s) {
      case 'NEW':
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-orange-100 text-orange-700 border border-orange-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
      </div>

      {loading && <div className="text-center py-8"><p className="text-gray-600">Завантаження...</p></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p className="text-red-700">{error}</p></div>}
      {!loading && orders.length === 0 && <div className="text-center py-8"><p className="text-gray-600">У вас поки немає замовлень.</p></div>}

      {/* Table */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-400 text-white">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-sm font-medium">
              <div>Order no</div>
              <div>Status</div>
              <div>Tracking ID</div>
              <div>Delivery Date</div>
              <div className="text-right">Price</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {orders.map((order: any) => {
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openDetails(order)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Order no */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{order.id}</span>
                  </div>


                  {/* Status */}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.orderStatus || order.status)}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                      {formatStatus(order.orderStatus || order.status)}
                    </span>
                  </div>

                  {/* Tracking ID */}
                  <div className="flex items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-900">{order.id}78</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-semibold text-gray-900">
                      ${typeof order.totalPrice === 'number' ? Number(order.totalPrice).toFixed(2) : '0.00'}
                    </span>
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
                    <div className="text-sm">Статус: {selectedOrder.orderStatus}</div>
                  )}
                  {selectedOrder.orderDate && (
                    <div className="text-sm">Створено: {new Date(selectedOrder.orderDate).toLocaleString()}</div>
                  )}
                  {typeof selectedOrder.totalPrice === 'number' && (
                    <div className="font-semibold">Сума: {Number(selectedOrder.totalPrice).toFixed(2)} грн</div>
                  )}

                  {Array.isArray(selectedOrder.orderItems) && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Товари</div>
                      <ul className="divide-y">
                        {selectedOrder.orderItems.map((it: any, idx: number) => (
                          <li key={idx} className="py-3 flex items-start justify-between gap-6">
                            <div className="min-w-0 flex items-center gap-4">
                              {/* image */}
                              {(() => {
                                const prod = productMap[Number(it?.productId)];
                                const primary = prod?.pictures?.find((p: any) => p?.pictureType === 'PRIMARY') || prod?.pictures?.[0];
                                const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : undefined;
                                return imgUrl ? (
                                  <img src={imgUrl} alt={prod?.name || `Товар #${it?.productId ?? idx+1}`}
                                       className="w-16 h-16 object-contain rounded bg-gray-50" />
                                ) : (
                                  <div className="w-16 h-16 rounded bg-gray-100" />
                                );
                              })()}
                              <div className="min-w-0">
                                <div className="font-medium truncate text-base">{productMap[Number(it?.productId)]?.name || `Товар #${it?.productId ?? idx+1}`}</div>
                                {typeof it?.totalPrice === 'number' && (
                                  <div className="text-sm text-gray-600">Сума позиції: {Number(it.totalPrice).toFixed(2)} грн</div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-nowrap">x{Number(it?.quantity || 0)}</div>
                          </li>
                        ))}
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

export default OrdersPage;