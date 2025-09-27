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
  variant?: ProductCardVariant;
  className?: string;
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/500x500?text=No+Image';

const variantConfig: Record<ProductCardVariant, { card: string; imageWrapper: string }> = {
  grid: {
    card: 'w-80 max-w-[20rem] min-h-[28rem] md:min-h-[30rem] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01]',
    imageWrapper: 'h-64',
  },
  carousel: {
    card: 'w-72 max-w-[18rem] min-h-[26rem] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.01]',
    imageWrapper: 'h-56',
  },
};

const normalizeImageUrl = (url?: string | null) => {
  if (!url || !url.trim()) {
    return PLACEHOLDER_IMAGE;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://localhost:8080/${url}`;
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
  className = '',
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
          const match = favs.value.find((it) => Number(it.product?.id) === Number(id));
          setLiked(Boolean(match));
        }

        if (cartItems.status === 'fulfilled') {
          const found = cartItems.value.find((ci) => Number(ci.product?.id) === Number(id));
          setInCartQty(found ? (found.quantity || 0) : 0);
        }
      } catch {
        // ignore errors silently
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [id]);

  const addFavouriteOnce = async () => {
    if (!id || liked) return;
    try {
      setLoadingFav(true);
      await addFavourite(Number(id));
      setLiked(true);
    } catch {
      // ignore for now
    } finally {
      setLoadingFav(false);
    }
  };

  const handleAddToCart = async () => {
    if (!id) return;
    try {
      setAddingCart(true);
      await addToCartApi({ productId: Number(id), quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setInCartQty((prev) => prev + 1);
    } catch {
      // ignore
    } finally {
      setAddingCart(false);
    }
  };

  const config = variantConfig[variant];
  const normalizedImageUrl = normalizeImageUrl(imageUrl);

  const handleCardClick = () => {
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  return (
    <div
      className={`group ${config.card} h-full flex flex-col overflow-hidden bg-white rounded-3xl ${className} ${slug ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      role={slug ? 'button' : undefined}
      tabIndex={slug ? 0 : undefined}
    >
      <div className={`relative ${config.imageWrapper} flex items-center justify-center overflow-hidden transition-transform duration-1000 group-hover:scale-[1.01]`}> 
        <img
          src={normalizedImageUrl}
          alt={title}
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {discountPercent ? (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            {discountPercent}
          </div>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="space-y-2">
          <h3 className="text-base font-medium text-gray-900 line-clamp-2 min-h-[3.2rem]">
            {title}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-black text-lg">{price}</span>
            {oldPrice ? (
              <span className="text-gray-400 line-through text-sm">{oldPrice}</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={addingCart || !id}
            className="flex-1 bg-[#282828] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {addingCart ? 'Adding...' : inCartQty > 0 ? `In cart (${inCartQty})` : 'Add to cart'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addFavouriteOnce();
            }}
            disabled={loadingFav || !id || liked}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
            title={liked ? 'Already in favourites' : 'Add to favourites'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={liked ? 'red' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke={liked ? 'red' : 'currentColor'}
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