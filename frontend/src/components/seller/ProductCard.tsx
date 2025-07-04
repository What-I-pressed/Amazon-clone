import React from "react";
import Button from "../ui/button/Button";

interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  rating: number; // 0-5, can be fractional
  description: string;
  onAddToCart?: () => void;
}

function formatPrice(price: number) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating;
    const isPartial = i - rating < 1 && i - rating > 0;
    
    stars.push(
      <span key={i} className="relative inline-block">
        <svg
          width="20"
          height="20"
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
            width="20"
            height="20"
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

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  rating,
  description,
  onAddToCart,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 flex flex-col h-full w-full max-w-xs sm:max-w-sm md:max-w-xs mx-auto transition hover:shadow-lg">
      <div className="flex-shrink-0 flex justify-center items-center h-48 w-full mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={title}
          className="object-contain h-full w-full"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-2 min-h-[2.5em]">{title}</h3>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-brand-500">{formatPrice(price)}</span>
          <StarRating rating={rating} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5em]">{description}</p>
        <Button
          variant="primary"
          size="md"
          className="mt-auto w-full transition-transform transform hover:scale-105"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
