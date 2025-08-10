import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SellerStats from "../../components/seller/SellerStats";
import { fetchSellerProfile } from "../../api/seller";
import type { Seller } from "../../types/seller";

const SellerDashboard: React.FC = () => {
  const { id: sellerId } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) {
      setError("Ідентифікатор продавця не вказано");
      setLoading(false);
      return;
    }

    async function loadSeller() {
      try {
        setLoading(true);
        const data = await fetchSellerProfile(sellerId);
        setSeller(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    }

    loadSeller();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Помилка завантаження
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Продавець не знайдено
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Профіль продавця не існує або був видалений
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {seller.name?.charAt(0).toUpperCase() || "S"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {seller.name || "Продавець"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Рейтинг: {seller.rating}/5 ⭐
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/seller/${sellerId}/settings`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Налаштування
              </Link>
              <Link
                to={`/seller/${sellerId}/products/create`}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                + Додати товар
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Chart */}
            <SellerStats 
              monthlyIncome={seller.stats?.totalViews * 10 || 0}
              salesData={{
                weekly: {
                  labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
                  data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
                },
                monthly: {
                  labels: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"],
                  data: [15000, 18000, 22000, 19000, 25000, 28000, 32000, 30000, 35000, 38000, 42000, 45000],
                },
                yearly: {
                  labels: ["2020", "2021", "2022", "2023", "2024"],
                  data: [180000, 220000, 280000, 350000, 420000],
                },
              }}
            />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Швидкі дії
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to={`/seller/${sellerId}/products/create`}
                  className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">+</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Додати товар</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Створити новий товар</p>
                  </div>
                </Link>

                <Link
                  to={`/seller/${sellerId}/orders`}
                  className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Замовлення</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Переглянути замовлення</p>
                  </div>
                </Link>

                <Link
                  to={`/seller/${sellerId}/reviews`}
                  className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">⭐</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Відгуки</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Відповісти на відгуки</p>
                  </div>
                </Link>

                <Link
                  to={`/seller/${sellerId}/analytics`}
                  className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Аналітика</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Детальна статистика</p>
                  </div>
                </Link>

                <Link
                  to={`/seller/${sellerId}/products`}
                  className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🛍️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Товари</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Управління товарами</p>
                  </div>
                </Link>

                <Link
                  to={`/seller/${sellerId}/settings`}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">⚙️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Налаштування</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Профіль та налаштування</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Інформація про продавця
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Товарів:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.stats?.productsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Замовлень:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.stats?.ordersCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Переглядів:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.stats?.totalViews || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Рейтинг:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.rating}/5 ⭐
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Остання активність
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Нове замовлення #1234</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 години тому</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Додано новий товар</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 годин тому</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">Новий відгук</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 день тому</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
