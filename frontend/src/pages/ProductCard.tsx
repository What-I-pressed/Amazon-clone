import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addFavourite, deleteFavourite } from "../api/favourites";

type ProductCardVariant = 'grid' | 'carousel';

type ProductCardProps = {
  id?: string | number;
  slug?: string;
  imageUrl: string;
  title: string;
  price: string; 
  oldPrice?: string; 
  discountPercent?: string; 
  variant?: ProductCardVariant;
  className?: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  slug,
  imageUrl,
  title,
  price,
  oldPrice,
  discountPercent,
  variant = 'grid',
  className = "",
}) => {
  const [liked, setLiked] = useState(false);
  const [favouriteId, setFavouriteId] = useState<number | null>(null);
  const [loadingFav, setLoadingFav] = useState(false);

  const toggleFavourite = async () => {
    if (!id) return; // cannot favourite without product id
    try {
      setLoadingFav(true);
      if (!liked) {
        const createdId = await addFavourite(Number(id));
        setFavouriteId(createdId);
        setLiked(true);
      } else {
        if (favouriteId != null) {
          await deleteFavourite(favouriteId);
        }
        setFavouriteId(null);
        setLiked(false);
      }
    } catch (e) {
      // optional: show toast
    } finally {
      setLoadingFav(false);
    }
  };

  const cardWidth = variant === 'carousel' ? 'w-72' : 'w-80';
  const imageHeight = variant === 'carousel' ? 'h-56' : 'h-80';

  return (
    <div
      className={`${cardWidth} h-full flex rounded-md flex-col overflow-hidden bg-white ${className}`}
    >
      {/* Image + Discount */}
      <div className={`relative ${imageHeight} group overflow-hidden`}>
        {slug ? (
          <Link to={`/product/${slug}`} className="block w-full h-full">
            <img 
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105 cursor-pointer rounded-3xl bg-white"
            />
          </Link>
        ) : (
          <img 
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105 rounded-3xl bg-white"
          />
        )}
        {discountPercent ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
            {discountPercent}
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 flex flex-col">
        {slug ? (
          <Link to={`/product/${slug}`} className="block">
            <h3 className="text-base font-medium text-gray-800 hover:underline cursor-pointer line-clamp-2">{title}</h3>
          </Link>
        ) : (
          <h3 className="text-base font-medium text-gray-800 line-clamp-2">{title}</h3>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">{price}</span>
          {oldPrice ? (
            <span className="text-gray-400 line-through text-sm">{oldPrice}</span>
          ) : null}
        </div>

        {/* Button + Wishlist */}
        <div className="flex items-center gap-4 mt-auto pt-2">
          <button className="flex-1 bg-[#282828] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition">
            Add to cart
          </button>
          <button
            onClick={toggleFavourite}
            disabled={loadingFav || !id}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
            title={liked ? "Remove from favourites" : "Add to favourites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={liked ? "red" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke={liked ? "red" : "currentColor"}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.74 0-3.278 1.012-4.062 2.475A4.875 4.875 0 008.25 3.75C5.66 3.75 3.563 5.765 3.563 8.25c0 7.22 8.437 11.25 8.437 11.25s8.438-4.03 8.438-11.25z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;