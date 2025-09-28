import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SellerStatsCard from "../../components/seller/SellerStats";
import type { Seller } from "../../types/seller";
import type { SellerStats as SellerStatsData } from "../../types/sellerstats";
import type { Review } from "../../types/review";
import { fetchSellerProfile, fetchSellerStats, fetchSellerReviews } from "../../api/seller";
import { replyReview } from "../../api/reviews";
import { Star } from "lucide-react";

const SellerDashboard: React.FC = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [stats, setStats] = useState<SellerStatsData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSeller = async () => {
      try {
        const [profile, statsData, sellerReviews] = await Promise.all([
          fetchSellerProfile(),
          fetchSellerStats(),
          fetchSellerReviews(),
        ]);
        setSeller(profile);
        setStats(statsData);
        setReviews(sellerReviews);
      } catch (err: any) {
        setError("Не вдалося завантажити профіль продавця");
        console.error("[SellerDashboard] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSeller();
  }, []);

  const flattenReviews = useMemo(() => {
    const repliesByParent: Record<number, Review[]> = {};
    reviews.forEach((review) => {
      if (review.parentId) {
        repliesByParent[review.parentId] = repliesByParent[review.parentId] || [];
        repliesByParent[review.parentId].push(review);
      }
    });

    return reviews
      .filter((review) => !review.parentId)
      .map((review) => ({
        review,
        replies: repliesByParent[review.id] || [],
      }));
  }, [reviews]);

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

  const handleReply = async (parentReviewId: number) => {
    if (!replyText.trim()) {
      setReplyError("Відповідь не може бути порожньою");
      return;
    }
    setReplyError(null);
    setReplySuccess(null);
    setIsSubmittingReply(true);
    try {
      await replyReview({
        parentId: parentReviewId,
        description: replyText.trim(),
      });
      setReplySuccess("Відповідь успішно надіслана");
      setReplyText("");
      setReplyingReviewId(null);

      const sellerReviews = await fetchSellerReviews();
      setReviews(sellerReviews);
    } catch (err) {
      console.error("[SellerDashboard] Reply error", err);
      setReplyError("Не вдалося надіслати відповідь. Перевірте, чи відгук належить вашому товару.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="min-h-screen text-black">
      {/* Header */}
      <div className="bg-gray-200 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {seller?.username ? seller.username.charAt(0).toUpperCase() : ''}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{seller?.username || 'Продавець'}</h1>
              <p className="text-gray-700">
                Рейтинг: {stats?.avgFeedback ? stats.avgFeedback.toFixed(2) : "—"}/5 ⭐
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              to={`/seller/edit`}
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
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <SellerStatsCard
            totalRevenue={stats?.totalRevenue ?? 0}
            avgFeedback={stats?.avgFeedback ?? 0}
            reviewsCount={stats?.reviewsCount ?? 0}
            totalOrders={stats?.totalOrders ?? 0}
            salesData={stats ? {
              weekly: stats.salesWeekly,
              monthly: stats.salesMonthly,
              yearly: stats.salesYearly,
            } : null}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl -sm p-6 border border-gray-200">
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
          {/* Reviews & Replies */}
          <div className="bg-[#F8F8F8] rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Відгуки покупців</h2>
              <span className="text-sm text-gray-500">Загалом: {reviews.length}</span>
            </div>

            {replyError && (
              <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
                {replyError}
              </div>
            )}
            {replySuccess && (
              <div className="mb-3 rounded bg-green-100 text-green-700 px-3 py-2 text-sm">
                {replySuccess}
              </div>
            )}

            {flattenReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Наразі немає відгуків для ваших товарів.
              </div>
            ) : (
              <div className="space-y-4">
                {flattenReviews.map(({ review, replies }) => (
                  <div key={review.id} className="border rounded-xl p-4 bg-white -sm">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium flex-1 text-gray-900">
                        {review.username ?? "User"}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleString("uk-UA")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          className={idx < (review.stars || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{review.description}</p>

                    {replies.length > 0 && (
                      <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
                        {replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="font-medium text-sm text-gray-700">{reply.username ?? "User"}</div>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.date).toLocaleString("uk-UA")}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{reply.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      {replyingReviewId === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full border rounded-lg p-2 text-sm bg-white"
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Напишіть відповідь на відгук"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-md hover:bg-black transition disabled:bg-gray-500"
                              onClick={() => handleReply(review.id)}
                              disabled={isSubmittingReply}
                            >
                              {isSubmittingReply ? "Відправлення..." : "Відповісти"}
                            </button>
                            <button
                              className="text-sm text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                setReplyingReviewId(null);
                                setReplyText("");
                              }}
                              disabled={isSubmittingReply}
                            >
                              Скасувати
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="mt-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                          onClick={() => {
                            setReplyingReviewId(review.id);
                            setReplyText("");
                            setReplyError(null);
                            setReplySuccess(null);
                          }}
                        >
                          Відповісти на відгук
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-2xl -sm p-6 border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4">Інформація про продавця</h2>
          <div className="space-y-3">
            <InfoRow label="Замовлень всього:" value={stats?.totalOrders ?? 0} />
            <InfoRow label="Активні:" value={stats?.activeOrders ?? 0} />
            <InfoRow label="Виконані:" value={stats?.completedOrders ?? 0} />
            <InfoRow label="Скасовані:" value={stats?.cancelledOrders ?? 0} />
            <InfoRow label="Дохід:" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} />
            <InfoRow label="Відгуків:" value={stats?.reviewsCount ?? 0} />
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