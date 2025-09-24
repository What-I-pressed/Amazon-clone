import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerStats from "../../components/seller/SellerStats";
import type { Seller } from "../../types/seller";
import { fetchSellerProfile } from "../../api/seller"; 

const SellerDashboard: React.FC = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSeller = async () => {
      try {
        const profile = await fetchSellerProfile(); 
        setSeller(profile);
      } catch (err: any) {
        setError("Не вдалося завантажити профіль продавця");
        console.error("[SellerDashboard] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeller();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <div className="bg-gray-200 shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {seller?.username ? seller.username.charAt(0).toUpperCase() : ''}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{seller?.username || 'Продавець'}</h1>
              <p className="text-gray-700">Рейтинг: {seller?.rating}/5 ⭐</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/seller/settings`}
              className="px-4 py-2 text-sm font-medium bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Налаштування
            </Link>
            <Link
              to={`/seller/products/create`}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-black transition"
            >
              + Додати товар
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <SellerStats
            monthlyIncome={seller?.stats?.totalRevenue || 0}
            salesData={{
              weekly: { labels: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"], data: [1200,1900,1500,2100,1800,2400,2200] },
              monthly: { labels: ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"], data: [15000,18000,22000,19000,25000,28000,32000,30000,35000,38000,42000,45000] },
              yearly: { labels: ["2020","2021","2022","2023","2024"], data: [180000,220000,280000,350000,420000] },
            }}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300 hover:shadow-lg transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4">Швидкі дії</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/seller/products/create" className="flex items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <div className="w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center mr-3">+</div>
                <div>
                  <h3 className="font-medium">Додати товар</h3>
                  <p className="text-sm text-gray-600">Створити новий товар</p>
                </div>
              </Link>

              <Link to="/seller/orders" className="flex items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <div className="w-10 h-10 bg-gray-700 text-white rounded-lg flex items-center justify-center mr-3">📦</div>
                <div>
                  <h3 className="font-medium">Замовлення</h3>
                  <p className="text-sm text-gray-600">Переглянути замовлення</p>
                </div>
              </Link>

              <Link to="/seller/reviews" className="flex items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <div className="w-10 h-10 bg-gray-600 text-white rounded-lg flex items-center justify-center mr-3">⭐</div>
                <div>
                  <h3 className="font-medium">Відгуки</h3>
                  <p className="text-sm text-gray-600">Відповісти на відгуки</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300 hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4">Інформація про продавця</h2>
          <div className="space-y-3">
            <InfoRow label="Товарів:" value={seller?.stats?.totalOrders ?? 0} />
            <InfoRow label="Активні:" value={seller?.stats?.activeOrders ?? 0} />
            <InfoRow label="Виконані:" value={seller?.stats?.completedOrders ?? 0} />
            <InfoRow label="Скасовані:" value={seller?.stats?.cancelledOrders ?? 0} />
            <InfoRow label="Дохід:" value={`$${(seller?.stats?.totalRevenue || 0).toFixed(2)}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div className="flex justify-between hover:bg-gray-100 px-2 py-1 rounded transition">
    <span className="text-gray-700">{label}</span>
    <span className="font-medium">{value ?? 0}</span>
  </div>
);

export default SellerDashboard;
