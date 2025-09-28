import React from "react";

interface ReviewReplyProps {
  replierName: string;
  replyText: string;
  replyDate: string;
}

export const ReviewReply: React.FC<ReviewReplyProps> = ({
  replierName,
  replyText,
  replyDate,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="ml-4 md:ml-6 lg:ml-8 mt-3 pl-4 border-l-2 border-[#e7e7e7] dark:border-[#454545] bg-white dark:bg-[#2a2a2a]/50 rounded-r-lg">
      {/* Reply Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
            {replierName}
          </span>
          <span className="text-xs text-[#838383] dark:text-[#989898]">
            (Seller)
          </span>
        </div>
        <span className="text-xs text-[#838383] dark:text-[#989898]">
          {formatDate(replyDate)}
        </span>
      </div>

      {/* Reply Text */}
      <div className="text-sm text-[#454545] dark:text-[#dadada] leading-relaxed">
        {replyText}
      </div>

      {/* Reply Indicator */}
      <div className="flex items-center gap-1 mt-2">
        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
        <span className="text-xs text-[#838383] dark:text-[#989898] font-medium">
          Seller Reply
        </span>
      </div>
    </div>
  );
};

export default ReviewReply;
