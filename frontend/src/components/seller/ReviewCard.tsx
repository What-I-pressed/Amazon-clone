import React from "react";
import ReviewReply from "./ReviewReply";

interface Reply {
  replierName: string;
  replyText: string;
  replyDate: string;
}

interface ReviewCardProps {
  username: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  replies?: Reply[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating;
    const isPartial = i - rating < 1 && i - rating > 0;
    
    stars.push(
      <span key={i} className="relative inline-block">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isFilled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
        >
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="currentColor"
          />
        </svg>
        {isPartial && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 left-0 text-yellow-400"
            style={{ 
              clipPath: `inset(0 ${100 - (rating - Math.floor(rating)) * 100}% 0 0)` 
            }}
          >
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="currentColor"
            />
          </svg>
        )}
      </span>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  username,
  rating,
  comment,
  date,
  images = [],
  replies = [],
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 md:p-6">
      {/* Header - Username, Rating, and Date */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {username}
            </h3>
            <StarRating rating={rating} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(date)}
          </p>
        </div>
      </div>

      {/* Comment Text */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment}
        </p>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Button */}
      <div className="mb-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:border-brand-300 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
          >
            <path
              d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Reply
        </button>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply, index) => (
            <ReviewReply
              key={index}
              replierName={reply.replierName}
              replyText={reply.replyText}
              replyDate={reply.replyDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
