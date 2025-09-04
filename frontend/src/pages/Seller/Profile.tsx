import { useEffect, useState } from "react";
import { fetchSellerProfile, fetchSellerStats } from "../../api/seller";
import { fetchSellerProducts } from "../../api/products"; 
import type { Seller } from "../../types/seller";
import type { SellerStats } from "../../types/sellerstats";
import type { Product } from "../../types/product";

const SellerProfileView = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sellerData: Seller = await fetchSellerProfile();

        setSeller({
          ...sellerData,
          stats: {
            totalOrders: 0,
            activeOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0,
          },
        });

        const stats: SellerStats = await fetchSellerStats();
        setSeller(prev => prev ? { ...prev, stats } : prev);

        const productsData: Product[] = await fetchSellerProducts(sellerData.id, 0, 12);
        setProducts(productsData);
      } catch (e) {
        console.error("Ошибка при загрузке данных селлера:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 animate-pulse">
        Завантаження профілю...
      </div>
    );

  if (!seller)
    return (
      <div className="text-gray-500 text-center mt-4">Профіль не знайдено</div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-700">
          {seller.name}
        </h1>
      </div>

      <div className="p-6 md:p-12 space-y-12">
        {/* Profile Header */}
        <div className="bg-white shadow-sm border rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={seller.avatar}
            alt="Seller Avatar"
            className="w-20 h-20 rounded-full border border-gray-300"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{seller.name}</h2>
            <p className="text-sm text-gray-500">{seller.email}</p>
            <div className="mt-2 flex items-center">
              <span className="text-yellow-500 mr-1 text-lg">★</span>
              <span className="text-gray-700 font-medium">{seller.rating}</span>
            </div>
            {seller.description && (
              <p className="mt-4 text-gray-700">{seller.description}</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Всього замовлень", value: seller.stats?.totalOrders ?? 0 },
              { label: "Виконані", value: seller.stats?.completedOrders ?? 0 },
              { label: "Скасовані", value: seller.stats?.cancelledOrders ?? 0 },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border rounded-lg p-6 text-center hover:shadow transition"
              >
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Товари продавця
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-end"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Image</span>
                </div>
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.description}</p>
                  <div className="mt-2 text-lg font-bold text-amazon-blue">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="mt-1 flex items-center text-yellow-500">
                    {"★".repeat(Math.floor(product.rating || 0))}
                    {"☆".repeat(5 - Math.floor(product.rating || 0))}
                    <span className="text-gray-600 text-sm ml-2">
                      {(product.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Продано: {product.sold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerProfileView;
