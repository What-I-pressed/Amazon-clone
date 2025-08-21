import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fetchSellerProfile } from "../../api/seller";
import type { Seller } from "../../types/seller";

const SellerAnalytics: React.FC = () => {
  const { id: sellerId } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year">("month");

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

  const getSalesChartOptions = (): ApexOptions => ({
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff", "#9CB9FF"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: timeFilter === "week" 
        ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
        : timeFilter === "month"
        ? ["Тиждень 1", "Тиждень 2", "Тиждень 3", "Тиждень 4"]
        : ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"],
    },
    yaxis: {
      title: {
        text: "Продажі ($)",
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
  });

  const getSalesChartSeries = () => [
    {
      name: "Продажі",
      data: timeFilter === "week" 
        ? [1200, 1900, 1500, 2100, 1800, 2400, 2200]
        : timeFilter === "month"
        ? [8500, 12000, 9800, 15000]
        : [15000, 18000, 22000, 19000, 25000, 28000, 32000, 30000, 35000, 38000, 42000, 45000],
    },
    {
      name: "Доходи",
      data: timeFilter === "week"
        ? [800, 1200, 1000, 1400, 1100, 1600, 1500]
        : timeFilter === "month"
        ? [6000, 9000, 7500, 11000]
        : [12000, 14000, 18000, 15000, 20000, 22000, 25000, 24000, 28000, 30000, 33000, 36000],
    },
  ];

  const getProductPerformanceOptions = (): ApexOptions => ({
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: ["#10B981"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["Товар 1", "Товар 2", "Товар 3", "Товар 4", "Товар 5"],
    },
    yaxis: {
      title: {
        text: "Продажі",
      },
    },
  });

  const getProductPerformanceSeries = () => [
    {
      name: "Продажі",
      data: [44, 55, 57, 56, 61],
    },
  ];

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Аналітика продавця
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Детальна статистика та метрики
              </p>
            </div>
            <Link
              to={`/seller/${sellerId}/dashboard`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              ← Назад до дашборду
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Time Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Період аналітики
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeFilter("week")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeFilter === "week"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Тиждень
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeFilter === "month"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Місяць
                </button>
                <button
                  onClick={() => setTimeFilter("year")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeFilter === "year"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Рік
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Загальний дохід
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(seller.stats?.totalViews * 15 || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Замовлень
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {seller.stats?.ordersCount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">👁️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Переглядів
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {seller.stats?.totalViews || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Рейтинг
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {seller.rating}/5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Динаміка продажів
            </h2>
            <Chart
              options={getSalesChartOptions()}
              series={getSalesChartSeries()}
              type="area"
              height={350}
            />
          </div>

          {/* Product Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Продуктивність товарів
            </h2>
            <Chart
              options={getProductPerformanceOptions()}
              series={getProductPerformanceSeries()}
              type="bar"
              height={300}
            />
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Demographics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Демографія клієнтів
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Чоловіки</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Жінки</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Популярні категорії
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Електроніка</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">42%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Одяг</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Книги</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Інше</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
