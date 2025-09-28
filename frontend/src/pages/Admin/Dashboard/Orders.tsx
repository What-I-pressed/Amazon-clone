import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllOrdersAdmin,
  fetchCompletedOrders,
  fetchActiveOrders,
  fetchSellerOrders,
  setOrderStatusProcessing,
  setOrderStatusShipped,
  setOrderStatusDelivered,
  confirmOrder,
  cancelOrder,
} from "../../../api/orders";
import { fetchProductById } from "../../../api/products";
import { Order, OrderStatus } from "../../../types/order";
import { AuthContext } from "../../../context/AuthContext";

type FilterType = "all" | "active" | "completed" | "seller";

const AdminOrdersDashboard: React.FC = () => {
  const formatCurrency = (value: unknown) => {
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : "0.00";
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [productMap, setProductMap] = useState<Record<number, any>>({});
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  if (!auth) throw new Error("AdminOrdersDashboard must be used within AuthProvider");

  const loadOrders = async (filterType: FilterType) => {
    try {
      setLoading(true);
      setError(null);
      let data: Order[] = [];

      switch (filterType) {
        case "active":
          data = await fetchActiveOrders();
          break;
        case "completed":
          data = await fetchCompletedOrders();
          break;
        case "seller":
          data = await fetchSellerOrders();
          break;
        default:
          data = await fetchAllOrdersAdmin();
          break;
      }

      setOrders(data);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    loadOrders(filter);
  }, [auth.loading, auth.isAuthenticated, navigate, filter]);

  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = orders.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.buyer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setLoading(true);
      
      switch (newStatus) {
        case "PROCESSING":
          await setOrderStatusProcessing(orderId);
          break;
        case "SHIPPED":
          await setOrderStatusShipped(orderId);
          break;
        case "DELIVERED":
          await setOrderStatusDelivered(orderId);
          break;
        case "CONFIRMED":
          await confirmOrder(orderId);
          break;
        case "CANCELLED":
          await cancelOrder(orderId);
          break;
      }

      // Reload orders
      await loadOrders(filter);
    } catch (e: any) {
      setError(e?.message || "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);

    // Fetch product details
    const productIds = order.orderItems.map(item => item.productId);
    const uniqueIds = [...new Set(productIds)];
    
    try {
      const productPromises = uniqueIds.map(id => 
        fetchProductById(id).catch(() => null)
      );
      const products = await Promise.all(productPromises);
      
      const map: Record<number, any> = {};
      products.forEach((product, index) => {
        if (product) {
          map[uniqueIds[index]] = product;
        }
      });
      
      setProductMap(map);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  const closeOrderDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
    setProductMap({});
  };

  const formatStatus = (status: OrderStatus) => {
    switch (status) {
      case "NEW":
        return "New";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      case "CONFIRMED":
        return "Confirmed";
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "NEW":
        return "bg-gray-100 text-[#454545] border border-[#e7e7e7]";
      case "PROCESSING":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border border-red-200";
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-100 text-[#454545] border border-[#e7e7e7]";
    }
  };

  const getUserName = (order: Order) => {
    if (order.buyer) {
      return `${order.buyer.firstName} ${order.buyer.lastName}`;
    }
    return `User #${order.buyerId}`;
  };

  const getItemsCount = (order: Order) => {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#151515] mb-2">Admin Orders Dashboard</h1>
        <p className="text-[#585858]">Manage and monitor all orders in the system</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-[#e7e7e7] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-[#454545] hover:bg-[#e7e7e7]"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === "active"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-[#454545] hover:bg-[#e7e7e7]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === "completed"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-[#454545] hover:bg-[#e7e7e7]"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("seller")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === "seller"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-[#454545] hover:bg-[#e7e7e7]"
              }`}
            >
              Seller Orders
            </button>
          </div>
          
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by order ID, user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-[#dadada] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-[#585858]">Loading orders...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#585858]">No orders found matching your criteria.</p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-[#e7e7e7] overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-[#e7e7e7]">
            <div className="grid grid-cols-8 gap-4 px-6 py-3 text-sm font-medium text-[#454545]">
              <div>Order ID</div>
              <div>User</div>
              <div>Items</div>
              <div>Status</div>
              <div>Created At</div>
              <div>Updated At</div>
              <div>Total</div>
              <div>Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#e7e7e7]">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openOrderDetails(order)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openOrderDetails(order);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {/* Order ID */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-600">#{order.id}</span>
                </div>

                {/* User */}
                <div className="flex items-center">
                  <div className="text-sm">
                    <div className="font-medium text-[#151515]">{getUserName(order)}</div>
                    {order.buyer?.email && (
                      <div className="text-[#838383] text-xs">{order.buyer.email}</div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="flex items-center">
                  <span className="text-sm text-[#151515]">{getItemsCount(order)} items</span>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.orderStatus)}`}>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    {formatStatus(order.orderStatus)}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex items-center">
                  <span className="text-sm text-[#585858]">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Updated At */}
                <div className="flex items-center">
                  <span className="text-sm text-[#585858]">-</span>
                </div>

                {/* Total */}
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-[#151515]">
                    ${formatCurrency(order.totalPrice)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {order.orderStatus === "NEW" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "PROCESSING");
                      }}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      title="Process"
                    >
                      Process
                    </button>
                  )}
                  {order.orderStatus === "PROCESSING" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "SHIPPED");
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      title="Ship"
                    >
                      Ship
                    </button>
                  )}
                  {order.orderStatus === "SHIPPED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "DELIVERED");
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      title="Deliver"
                    >
                      Deliver
                    </button>
                  )}
                  {(order.orderStatus === "NEW" || order.orderStatus === "PROCESSING") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "CANCELLED");
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {detailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Order Details #{selectedOrder.id}</h3>
              <button
                onClick={closeOrderDetails}
                className="text-[#989898] hover:text-[#585858] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-[#838383] uppercase tracking-wide">Order Information</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#585858]">Order ID:</span>
                      <span className="text-sm font-medium">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#585858]">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                        {formatStatus(selectedOrder.orderStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#585858]">Created:</span>
                      <span className="text-sm">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#585858]">Total:</span>
                      <span className="text-sm font-semibold">${formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-[#838383] uppercase tracking-wide">Customer Information</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#585858]">Name:</span>
                      <span className="text-sm font-medium">{getUserName(selectedOrder)}</span>
                    </div>
                    {selectedOrder.buyer?.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[#585858]">Email:</span>
                        <span className="text-sm">{selectedOrder.buyer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-[#838383] uppercase tracking-wide mb-4">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map((item, index) => {
                    const product = productMap[item.productId];
                    const primaryImage = product?.pictures?.find((p: any) => p?.pictureType === 'PRIMARY') || product?.pictures?.[0];
                    const imageUrl = primaryImage?.url ? `http://localhost:8080/${primaryImage.url}` : null;
                    
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product?.name || `Product #${item.productId}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[#e7e7e7] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#989898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h5 className="font-medium text-[#151515]">
                            {product?.name || `Product #${item.productId}`}
                          </h5>
                          <div className="mt-1 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#585858]">Quantity:</span>
                              <span>{item.quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#585858]">Price:</span>
                              <span>${formatCurrency(item.price)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-[#151515]">Total:</span>
                              <span>${formatCurrency(item.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={closeOrderDetails}
                className="px-4 py-2 text-sm font-medium text-[#454545] bg-white border border-[#dadada] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersDashboard;
