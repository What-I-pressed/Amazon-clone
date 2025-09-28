import React from "react";
import Button from "../ui/button/Button";

interface OrderProduct {
  id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  orderId: string;
  orderDate: Date;
  status: "Delivered" | "Pending" | "Shipped" | "Cancelled" | "Processing";
  products: OrderProduct[];
  totalPrice: number;
  onViewOrder?: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusColor(status: OrderCardProps["status"]): string {
  const statusColors = {
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };
  return statusColors[status];
}

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  orderDate,
  status,
  products,
  totalPrice,
  onViewOrder,
}) => {
  return (
    <div className="bg-white dark:bg-[#151515] rounded-xl shadow-md border border-[#e7e7e7] dark:border-[#2a2a2a] p-4 md:p-6">
      {/* Header - Order ID, Date, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h3 className="font-semibold text-lg text-[#151515] dark:text-white">
            Order #{orderId}
          </h3>
          <span className="text-sm text-[#838383] dark:text-[#989898]">
            {formatDate(orderDate)}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </div>

      {/* Products List */}
      <div className="space-y-3 mb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-[#2a2a2a] rounded-lg"
          >
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm md:text-base text-[#151515] dark:text-white line-clamp-2">
                {product.title}
              </h4>
              <p className="text-sm text-[#838383] dark:text-[#989898]">
                Qty: {product.quantity}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-medium text-sm md:text-base text-[#151515] dark:text-white">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Total Price and View Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#e7e7e7] dark:border-[#454545]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-[#838383] dark:text-[#989898]">Total:</span>
          <span className="text-lg font-bold text-brand-500">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewOrder}
          className="w-full sm:w-auto"
        >
          View Order
        </Button>
      </div>
    </div>
  );
};

export default OrderCard;
