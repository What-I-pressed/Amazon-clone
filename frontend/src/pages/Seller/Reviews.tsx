import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import ReviewCard from "../../components/seller/ReviewCard";
import ReviewReply from "../../components/seller/ReviewReply";
import { fetchPublicSellerProfileBySlug } from "../../api/seller";
import type { Seller } from "../../types/seller";

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  replies?: {
    replierName: string;
    replyText: string;
    replyDate: string;
  }[];
}

const SellerReviews: React.FC = () => {
  const { slug: sellerSlug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "unreplied">("all");

  // Mock data for reviews
  const mockReviews: Review[] = [
    {
      id: "1",
      username: "Олександр Петренко",
      rating: 5,
      comment: "Відмінний продавець! Товар прийшов швидко, якість на висоті. Рекомендую!",
      date: "2024-12-15T10:30:00Z",
      images: ["/images/product-01.jpg"],
      replies: [
        {
          replierName: "Продавець",
          replyText: "Дякуємо за відгук! Раді, що товар сподобався.",
          replyDate: "2024-12-16T09:15:00Z"
        }
      ]
    },
    {
      id: "2",
      username: "Марія Іваненко",
      rating: 4,
      comment: "Хороший товар, але доставка затрималася на день. В цілому задоволена.",
      date: "2024-12-14T14:20:00Z",
      images: ["/images/product-02.jpg", "/images/product-03.jpg"]
    },
    {
      id: "3",
      username: "Віктор Сидоренко",
      rating: 2,
      comment: "Товар не відповідає опису. Розмір менший, ніж зазначено. Розчарований.",
      date: "2024-12-13T16:45:00Z",
      images: ["/images/product-04.jpg"]
    },
    {
      id: "4",
      username: "Анна Коваленко",
      rating: 5,
      comment: "Дуже задоволена покупкою! Швидка доставка, якісний товар. Обов'язково куплю ще!",
      date: "2024-12-12T11:10:00Z",
      images: ["/images/product-05.jpg"]
    },
    {
      id: "5",
      username: "Дмитро Мельник",
      rating: 3,
      comment: "Товар нормальний, але ціна трохи завищена. Можна було б дешевше.",
      date: "2024-12-11T13:30:00Z"
    }
  ];

  useEffect(() => {
    if (!sellerSlug) {
      setError("Slug продавця не вказано");
      setLoading(false);
      return;
    }

    async function loadSeller() {
      try {
        setLoading(true);
        // Use public seller profile endpoint for slug-based access
        const data = await fetchPublicSellerProfileBySlug(sellerSlug!);
        setSeller(data);
        setReviews(mockReviews);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    }

    loadSeller();
  }, [sellerSlug]);

  const filteredReviews = reviews.filter(review => {
    switch (filter) {
      case "positive":
        return review.rating >= 4;
      case "negative":
        return review.rating <= 2;
      case "unreplied":
        return !review.replies || review.replies.length === 0;
      default:
        return true;
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;
  const unrepliedReviews = reviews.filter(r => !r.replies || r.replies.length === 0).length;

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
                Відгуки клієнтів
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Управління відгуками та відповідями
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
          {/* Review Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Середній рейтинг
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">👍</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Позитивні відгуки
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {positiveReviews}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">👎</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Негативні відгуки
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {negativeReviews}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">💬</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Потребують відповіді
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {unrepliedReviews}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Фільтри відгуків
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === "all"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Всі ({reviews.length})
                </button>
                <button
                  onClick={() => setFilter("positive")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === "positive"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Позитивні ({positiveReviews})
                </button>
                <button
                  onClick={() => setFilter("negative")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === "negative"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Негативні ({negativeReviews})
                </button>
                <button
                  onClick={() => setFilter("unreplied")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === "unreplied"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Без відповіді ({unrepliedReviews})
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Відгуків не знайдено
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  За обраними фільтрами немає відгуків для відображення
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  username={review.username}
                  rating={review.rating}
                  comment={review.comment}
                  date={review.date}
                  images={review.images}
                  replies={review.replies}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredReviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Показано {filteredReviews.length} з {reviews.length} відгуків
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    Попередня
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    Наступна
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerReviews;
