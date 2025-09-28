import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFavourite, deleteFavourite, fetchFavourites } from "../api/favourites";
import { addToCart as addToCartApi, fetchCart, removeFromCart } from "../api/cart";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

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
  loading?: boolean;
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
  quantityInStock,
  variant = 'grid',
  className = '',
  loading = false,
}) => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isLoading = Boolean(loading);

  if (!auth && !isLoading) {
    throw new Error("ProductCard must be used within AuthProvider");
  }

  const [liked, setLiked] = useState(false);
  const [updatingFavourite, setUpdatingFavourite] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [inCartQty, setInCartQty] = useState<number>(0);
  const [cartItemId, setCartItemId] = useState<number | null>(null);
  const [favouriteId, setFavouriteId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (isLoading || !auth || !id) return;
      try {
        const favSet = auth?.favouriteProductIds;
        if (favSet) {
          setLiked(favSet.has(Number(id)));
        }
        try {
          const favourites = await fetchFavourites();
          if (!mounted) return;
          const favourite = favourites.find((fav) => Number(fav.product?.id) === Number(id));
          if (favourite) {
            setFavouriteId(favourite.id);
            setLiked(true);
          }
        } catch {
          // ignore favourite load failures
        }
        try {
          const cartItems = await fetchCart();
          if (!mounted) return;
          const found = cartItems.find((ci) => Number(ci.product?.id) === Number(id));
          setInCartQty(found ? (found.quantity || 0) : 0);
          setCartItemId(found ? found.id : null);
        } catch {
          // ignore cart load failures
        }
      } catch {
        // ignore favourite fetch failures
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [id, auth, isLoading]);

  const handleToggleFavourite = async () => {
    if (isLoading || !id) return;
    if (!auth?.isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingFavourite(true);

      if (liked) {
        if (favouriteId !== null) {
          await deleteFavourite(favouriteId);
        } else {
          const favourites = await fetchFavourites();
          const favourite = favourites.find((fav) => Number(fav.product?.id) === Number(id));
          if (favourite) {
            await deleteFavourite(favourite.id);
          }
        }
        setLiked(false);
        setFavouriteId(null);
        auth?.removeFavouriteId(Number(id));
        showToast("Removed from favorite");
      } else {
        const createdId = await addFavourite(Number(id));
        setFavouriteId(createdId);
        setLiked(true);
        auth?.addFavouriteId(Number(id));
        showToast("Added to favorite");
      }
    } catch {
      // ignore
    } finally {
      setUpdatingFavourite(false);
    }
  };

  const handleToggleCart = async () => {
    if (isLoading || !id) return;
    if (!auth?.isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingCart(true);

      if (inCartQty > 0) {
        if (cartItemId !== null) {
          await removeFromCart(cartItemId);
        } else {
          // Fallback: find the cart item before removing
          const cartItems = await fetchCart();
          const found = cartItems.find((ci) => Number(ci.product?.id) === Number(id));
          if (found) {
            await removeFromCart(found.id);
            setCartItemId(null);
          }
        }
        setInCartQty(0);
        setCartItemId(null);
        showToast("Removed from cart");
      } else {
        if (quantityInStock !== undefined && quantityInStock <= 0) {
          setUpdatingCart(false);
          return;
        }

        await addToCartApi({ productId: Number(id), quantity: 1 });
        const cartItems = await fetchCart();
        const added = cartItems.find((ci) => Number(ci.product?.id) === Number(id));
        setInCartQty(added?.quantity ?? 1);
        setCartItemId(added?.id ?? null);
        showToast("Added to cart");
      }

      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch {
      // ignore
    } finally {
      setUpdatingCart(false);
    }
  };

  const config = variantConfig[variant];
  const skeletonConfig = variant === 'grid'
    ? { card: 'w-64 max-w-[16rem] min-h-[22rem] md:min-h-[24rem]', image: 'h-52' }
    : { card: 'w-56 max-w-[14rem] min-h-[20rem]', image: 'h-44' };
  const normalizedImageUrl = isLoading ? null : normalizeImageUrl(imageUrl);

  const handleCardClick = () => {
    if (isLoading) return;
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-3xl bg-white ${skeletonConfig.card} ${className}`}
        aria-busy="true"
      >
        <div className={`bg-[#e7e7e7] animate-pulse ${skeletonConfig.image}`} aria-hidden="true" />
        <div className="p-4 flex flex-col flex-1">
          <div className="space-y-2 mb-4" aria-hidden="true">
            <div className="h-4 w-11/12 rounded-full bg-[#e7e7e7] animate-pulse" />
            <div className="h-4 w-7/12 rounded-full bg-[#e7e7e7] animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mb-6" aria-hidden="true">
            <div className="h-5 w-20 rounded-full bg-[#e7e7e7] animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-gray-100 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 mt-auto" aria-hidden="true">
            <div className="flex-1 h-10 rounded-3xl bg-[#e7e7e7] animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-[#e7e7e7] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group ${config.card} h-full flex flex-col overflow-hidden bg-white rounded-3xl ${className} ${slug ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      role={slug ? 'button' : undefined}
      tabIndex={slug ? 0 : undefined}
    >
      <div className={`relative ${config.imageWrapper} flex items-center justify-center overflow-hidden transition-transform duration-1000 group-hover:scale-[1.01]`}>
        <img
          src={normalizedImageUrl || PLACEHOLDER_IMAGE}
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
          <h3 className="text-base font-medium text-[#151515] line-clamp-2 min-h-[3.2rem]">
            {title}
          </h3>

          <div className="flex items-baseline gap-2 min-h-[1.5rem]">
            <span className="font-semibold text-black text-lg">{price}</span>
            {oldPrice ? (
              <span className="text-[#989898] line-through text-sm">{oldPrice}</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleCart(); }}
            disabled={
              updatingCart ||
              !id ||
              (inCartQty === 0 && quantityInStock !== undefined && quantityInStock <= 0)
            }
            className="flex-1 bg-[#282828] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {quantityInStock !== undefined && quantityInStock <= 0 && inCartQty === 0
              ? "Out of stock"
              : updatingCart
                ? "Updating..."
                : inCartQty > 0
                  ? "Remove from cart"
                  : "Add to cart"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavourite();
            }}
            disabled={updatingFavourite || !id}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#e7e7e7] disabled:opacity-50"
            title={liked ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={liked ? 'red' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke={liked ? 'red' : 'currentColor'}
              className={`w-6 h-6 transition-colors ${updatingFavourite ? 'opacity-70' : ''}`}
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