import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFavourite } from "../api/favourites";
import { addToCart as addToCartApi } from "../api/cart";
import { fetchFavourites } from "../api/favourites";
import { fetchCart } from "../api/cart";

type ProductCardVariant = 'grid' | 'carousel';

type ProductCardProps = {
  id?: string | number;
  slug?: string;
  imageUrl: string;
  title: string;
  price: string; 
  oldPrice?: string; 
  discountPercent?: string; 
  quantityInStock?: number;
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
  quantityInStock,
  variant = 'grid',
  className = "",
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [inCartQty, setInCartQty] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!id) return;
      try {
        const [favs, cartItems] = await Promise.allSettled([
          fetchFavourites(),
          fetchCart(),
        ]);
        if (!mounted) return;
        if (favs.status === 'fulfilled') {
          const f = favs.value.find((it) => Number(it.product?.id) === Number(id));
          if (f) { setLiked(true); } else { setLiked(false); }
        }
        if (cartItems.status === 'fulfilled') {
          const found = cartItems.value.find((ci) => Number(ci.product?.id) === Number(id));
          setInCartQty(found ? (found.quantity || 0) : 0);
        }
      } catch {
        // ignore
      }
    };
    init();
    return () => { mounted = false; };
  }, [id]);

  const addFavouriteOnce = async () => {
    if (!id || liked) return; // cannot add if already liked
    try {
      setLoadingFav(true);
      await addFavourite(Number(id));
      setLiked(true);
    } catch (e) {
      // optional: show toast
    } finally {
      setLoadingFav(false);
    }
  };

  const handleAddToCart = async () => {
    if (!id) return;
    if (quantityInStock !== undefined && inCartQty >= quantityInStock) return;
    try {
      setAddingCart(true);
      await addToCartApi({ productId: Number(id), quantity: 1 });
      // optional: show toast or update a global cart badge
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setInCartQty((q) => q + 1);
    } catch (e) {
      // optional: show toast
    } finally {
      setAddingCart(false);
    }
  };

  const cardWidth = variant === 'carousel' ? 'w-72' : 'w-80';
  const imageHeight = variant === 'carousel' ? 'h-56' : 'h-80';
  const displayedImageUrl = imageUrl?.startsWith('http') ? imageUrl : `http://localhost:8080/${imageUrl}`;

  return (
    <div
      className={`${cardWidth} h-full flex rounded-md flex-col overflow-hidden bg-white ${className} ${slug ? 'cursor-pointer' : ''}`}
      onClick={() => { if (slug) navigate(`/product/${slug}`); }}
      role={slug ? 'button' : undefined}
      tabIndex={slug ? 0 : undefined}
    >
      {/* Image + Discount */}
      <div className={`relative ${imageHeight} group overflow-hidden`}>
        <img 
          src={displayedImageUrl}
          alt={title}
          className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105 rounded-3xl bg-white"
        />
        {discountPercent ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
            {discountPercent}
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 flex flex-col">
        <h3 className="text-base font-medium text-gray-800 line-clamp-2">{title}</h3>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">{price}</span>
          {oldPrice ? (
            <span className="text-gray-400 line-through text-sm">{oldPrice}</span>
          ) : null}
        </div>

        {/* Button + Wishlist */}
        <div className="flex items-center gap-4 mt-auto pt-2">
          <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
          disabled={addingCart || !id || (quantityInStock !== undefined && quantityInStock <= 0)}
          className="flex-1 bg-[#282828] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {quantityInStock !== undefined && quantityInStock <= 0
            ? "Out of stock"
            : addingCart
              ? "Adding..."
              : inCartQty > 0
                ? `In cart (${inCartQty})`
                : "Add to cart"}
        </button>

          <button
            onClick={(e) => { e.stopPropagation(); addFavouriteOnce(); }}
            disabled={loadingFav || !id || liked}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
            title={liked ? "Already in favourites" : "Add to favourites"}
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