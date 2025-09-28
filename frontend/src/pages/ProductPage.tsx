import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product } from "../types/product";
import type { Seller } from "../types/seller";
import { fetchProductBySlug } from "../api/products";
import { fetchSellerProfileBySlug } from "../api/seller";
import { fetchProductReviews, createReview, deleteReview, replyReview } from "../api/reviews";
import { Review } from '../types/review';
import { AuthContext } from "../context/AuthContext";
import { Star, ArrowLeft, ArrowRight, X, Tag } from 'lucide-react';
import { addToCart as addToCartApi, fetchCart } from "../api/cart";
import { addFavourite, deleteFavourite, fetchFavourites } from "../api/favourites";


const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

const getDiscountMeta = (product: Product | null) => {
  if (!product) {
    return {
      baselinePrice: 0,
      percent: 0,
      isActive: false,
      status: "none" as const,
      startsAt: null as string | null,
      endsAt: null as string | null,
    };
  }

  const price = product.price ?? 0;
  const baselinePrice = product.priceWithoutDiscount && product.priceWithoutDiscount > 0
    ? product.priceWithoutDiscount
    : price;

  const startsAt = product.discountLaunchDate ?? null;
  const endsAt = product.discountExpirationDate ?? null;

  const computedPercent = baselinePrice > 0 ? ((baselinePrice - price) / baselinePrice) * 100 : 0;
  const percent = product.discountPercentage ?? Math.max(0, Math.round(computedPercent * 100) / 100);

  const now = new Date();
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;

  const isAfterStart = startDate ? now >= startDate : true;
  const isBeforeEnd = endDate ? now <= endDate : true;
  const baselineLowerThanPrice = baselinePrice <= price;


  let status: "none" | "active" | "scheduled" | "finished" = "none";

  if (baselineLowerThanPrice || percent <= 0) {
    status = "none";
  } else if (!isAfterStart) {
    status = "scheduled";
  } else if (!isBeforeEnd) {
    status = "finished";
  } else {
    status = "active";
  }

  const isActive = status === "active" || (product.hasDiscount ?? false);

  return {
    baselinePrice,
    percent: Math.max(0, percent),
    isActive,
    status,
    startsAt,
    endsAt,
  };
};

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const wheelCooldownRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const [addingCart, setAddingCart] = useState(false);
  const [inCartQty, setInCartQty] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [favouriteId, setFavouriteId] = useState<number | null>(null);
  const isOutOfStock = (product?.quantityInStock ?? 0) <= 0;

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [postingReview, setPostingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const auth = useContext(AuthContext);
  const currentUser = auth?.user || null;

  const [showFullDescription, setShowFullDescription] = useState(false);

  const discountMeta = useMemo(() => getDiscountMeta(product), [product]);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const productData = await fetchProductBySlug(slug);
        if (!isMounted) return;
        setProduct(productData);
        setActiveImageIdx(0);

        if (productData.sellerSlug) {
          const sellerData = await fetchSellerProfileBySlug(productData.sellerSlug);
          if (!isMounted) return;
          setSeller(sellerData);
        }
        // compute if product already in cart
        try {
          const cartItems = await fetchCart();
          if (!isMounted) return;
          const found = cartItems.find((ci) => ci.product?.id === productData.id);
          setInCartQty(found ? (found.quantity || 0) : 0);
        } catch {
          setInCartQty(0);
        }
        // Use favourite product IDs from AuthContext for instant check
        try {
          const favSet = auth?.favouriteProductIds;
          if (favSet && productData.id != null) {
            const isFav = favSet.has(Number(productData.id));
            setLiked(isFav);
            // We don't know favouriteId yet unless we fetch or we just created it
            setFavouriteId(null);
          } else {
            setLiked(false);
            setFavouriteId(null);
          }
        } catch {
          // ignore
        }
      } catch (e: unknown) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "Сталася помилка завантаження товару");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [slug]);

  const images: string[] = useMemo(() => {
    if (product?.pictures && product.pictures.length > 0) {
      return product.pictures.map(p => `http://localhost:8080/${p.url}`);
    }
    return ["/images/product/placeholder.jpg"];
  }, [product]);

  const displayedThumbnails = useMemo(() => {
    // Always show 2 thumbnails
    return images.slice(0, 2);
  }, [images]);

  const extraImagesCount = images.length > 2 ? images.length - 2 : 0;

  // Reload reviews function
  const loadReviews = useCallback(async () => {
    if (!product?.id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const list = await fetchProductReviews(product.id);
      
      // Restructure reviews to nest replies under parents
      const reviewsMap = new Map<number, Review>();
      const topLevelReviews: Review[] = [];
      
      // First pass: create map and identify top-level reviews
      list.forEach(review => {
        reviewsMap.set(review.id, { ...review, replies: [] });
        if (!review.parentId) {
          topLevelReviews.push(reviewsMap.get(review.id)!);
        }
      });
      
      // Second pass: nest replies under parents
      list.forEach(review => {
        if (review.parentId) {
          const parent = reviewsMap.get(review.parentId);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(reviewsMap.get(review.id)!);
          }
        }
      });
      
      // Sort by date descending
      const sorted = [...topLevelReviews].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });
      
      setReviews(sorted);
    } catch (e) {
      setReviewsError(e instanceof Error ? e.message : "Не вдалося завантажити відгуки");
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  // Load reviews when product is available
  useEffect(() => {
    loadReviews();
  }, [product?.id, loadReviews]);

  const handleDeleteReview = async (reviewId: number) => {
    if (!product?.id || !window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
    
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      // Reload reviews to get updated list
      await loadReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Не вдалося видалити відгук. Спробуйте пізніше.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id || !newReviewText.trim()) return;
    
    setPostingReview(true);
    try {
      await createReview({
        productId: product.id,
        description: newReviewText.trim(),
        stars: newReviewStars,
      });
      setNewReviewText("");
      setNewReviewStars(5);
      await loadReviews(); // Reload reviews to get the latest data
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to post review");
    } finally {
      setPostingReview(false);
    }
  };

  
  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setPostingReply(true);
    try {
      await replyReview({
        parentId,  // Changed from parentReviewId
        description: replyText.trim(),
      });
      setReplyText("");
      setReplyingToReviewId(null);
      await loadReviews(); // Reload reviews to get the latest data
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to post reply");
    } finally {
      setPostingReply(false);
    }
  };

  // Lightbox controls
  const openLightbox = (index: number) => {
    setActiveImageIdx(index);
    setLightboxOpen(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };
  const closeLightbox = () => setLightboxOpen(false);
  const showNext = () => setActiveImageIdx((idx) => (images.length ? (idx + 1) % images.length : idx));
  const showPrev = () => setActiveImageIdx((idx) => (images.length ? (idx - 1 + images.length) % images.length : idx));

  const zoomIn = () => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => {
    const next = Math.max(1, +(z - 0.25).toFixed(2));
    if (next === 1) setOffset({ x: 0, y: 0 });
    return next;
  });
  const resetZoom = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const handleAddToCart = async () => {
    if (!product?.id) return;

    const maxAddable = (product.quantityInStock ?? 0) - inCartQty;
    if (maxAddable <= 0) return;

    try {
      setAddingCart(true);
      await addToCartApi({ productId: Number(product.id), quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setInCartQty((q) => q + 1);
    } catch {
      // optionally show toast
    } finally {
      setAddingCart(false);
    }
  };

  const toggleFavourite = async () => {
    if (!product?.id) return;
    try {
      if (!liked) {
        const createdId = await addFavourite(Number(product.id));
        setFavouriteId(createdId);
        setLiked(true);
        // update global fav set
        auth?.addFavouriteId(Number(product.id));
      } else {
        let toDeleteId = favouriteId;
        if (toDeleteId == null) {
          // lazily fetch favourites to find the id for this product
          try {
            const favs = await fetchFavourites();
            const match = favs.find((f) => f.product?.id === product.id);
            toDeleteId = match?.id ?? null;
          } catch {
            // ignore
          }
        }
        if (toDeleteId != null) {
          await deleteFavourite(toDeleteId);
        }
        setFavouriteId(null);
        setLiked(false);
        auth?.removeFavouriteId(Number(product.id));
      }
    } catch {
      // optionally show toast
    }
  };

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, images.length]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151515]"></div>
    </div>
  );
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!product) return <div className="p-6 text-center">Товар не знайдено</div>;


  const mainPrice = formatCurrency(product.price);
  const baselinePriceLabel = discountMeta.baselinePrice > 0 ? formatCurrency(discountMeta.baselinePrice) : null;
  const showBaseline = discountMeta.baselinePrice > product.price && discountMeta.percent > 0;
  const discountLabel = discountMeta.percent > 0 ? `-${Math.round(discountMeta.percent)}%` : null;
  const discountStarts = formatDate(discountMeta.startsAt);
  const discountEnds = formatDate(discountMeta.endsAt);
  const averageRating = typeof product.avgRating === 'number'
    ? product.avgRating
    : (typeof product.rating === 'number' ? product.rating : null);
  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : null;
  const hasRating = averageRating != null;

  return (
    <div className="min-h-screen bg-white p-2 pt-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="w-full max-w-md self-start flex gap-4">
          {/* Thumbnails column - always 3 items */}
          <div className="flex flex-col gap-8 w-32">
            {displayedThumbnails.map((src, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImageIdx(idx)}
                className="w-full flex-1 aspect-[3/4] rounded-md overflow-hidden bg-white"
              >
                <img 
                  src={src} 
                  alt={`${product.name} thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
            {/* Always show button as 3rd item with 3:4 ratio */}
            <button
              onClick={() => openLightbox(2)}
              className="w-full flex-1 aspect-[3/4] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-medium"
            >
              +{extraImagesCount > 0 ? extraImagesCount : images.length > 0 ? 1 : 0}
            </button>
          </div>
          
          {/* Main image container */}
          <div className="flex-1 aspect-[4/5] rounded-md overflow-hidden bg-white flex-shrink-0">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => openLightbox(activeImageIdx)}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 relative">
        <button 
            onClick={toggleFavourite}
            className="absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={liked ? "red" : "none"} viewBox="0 0 24 24" strokeWidth={1.8} stroke={liked ? "red" : "currentColor"} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.74 0-3.278 1.012-4.062 2.475A4.875 4.875 0 008.25 3.75C5.66 3.75 3.563 5.765 3.563 8.25c0 7.22 8.437 11.25 8.437 11.25s8.438-4.03 8.438-11.25z" />
            </svg>
          </button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold pr-12">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-black">{mainPrice}</span>
              {showBaseline && baselinePriceLabel ? (
                <span className="text-lg text-[#989898] line-through">{baselinePriceLabel}</span>
              ) : null}
              {discountLabel ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <Tag className="w-4 h-4" />
                  {discountLabel}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#2C2C2C]">
              <Star
                className={hasRating && averageRating! > 0 ? 'w-4 h-4 fill-[#F5A524] text-[#F5A524]' : 'w-4 h-4 text-[#989898]'}
              />
              {hasRating ? (
                <>
                  <span className="font-medium">{averageRating!.toFixed(1)}</span>
                  {reviewCount != null ? (
                    <span className="text-[#838383]">({reviewCount} review{reviewCount === 1 ? '' : 's'})</span>
                  ) : null}
                </>
              ) : (
                <span className="text-[#838383]">No ratings yet</span>
              )}
            </div>
            {(discountMeta.status === "scheduled" || discountMeta.status === "finished") && (discountStarts || discountEnds) ? (
              <div className="text-xs text-[#585858] flex flex-col">
                {discountMeta.status === "scheduled" && discountStarts ? (
                  <span>Discount starts on {discountStarts}</span>
                ) : null}
                {discountMeta.status === "scheduled" && discountEnds ? (
                  <span>Ends on {discountEnds}</span>
                ) : null}
                {discountMeta.status === "finished" && discountEnds ? (
                  <span>Discount ended on {discountEnds}</span>
                ) : null}
              </div>
            ) : null}
            {discountMeta.status === "active" && discountEnds ? (
              <span className="text-xs text-green-600">Active discount until {discountEnds}</span>
            ) : null}
          </div>
          
          {/* Seller Info */}
          {seller && (
            <Link to={`/seller/${seller.slug}`} className="block p-4 bg-white rounded-2xl border-[1px] border-[#E0E0E0] hover:shadow-md transition">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {seller.url && <img src={`http://localhost:8080/${seller.url}`} alt={seller.username} className="w-16 h-16 rounded-full object-cover" />}
                  <p className="font-semibold text-lg">{seller.username}</p>
                </div>
                <div className="flex items-center text-black text-sm">
                  Show More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )}
          
          {/* Dividing line between seller info and description */}
          <div className="border-t border-[#DDDDDD] my-8"></div>
          
          <p className="text-[#454545] leading-relaxed">
            {showFullDescription ? product.description : product.description.slice(0, 500)}
            {!showFullDescription && product.description.length > 500 && '... '}
            {!showFullDescription && product.description.length > 500 && (
              <button 
                onClick={() => setShowFullDescription(true)}
                className="text-black"
              >
                Load more
              </button>
            )}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || isOutOfStock}
              className="flex-1 bg-[#42A275] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isOutOfStock
                ? "Out of stock"
                : addingCart
                  ? "Adding..."
                  : inCartQty > 0
                    ? `In cart (${inCartQty})`
                    : "Add to cart"}
            </button>
           
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#585858]">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17h4V5H2v12h3m5 0l-3 3l-3-3m12 2v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m0-4V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v6"/>
              </svg>
              <span>Free worldwide shipping on all orders over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
              </svg>
              <span>Delivers in 3-7 Working Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto mt-12 mb-12 grid grid-cols-1 gap-8">
        <section className="bg-[#F8F8F8] rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

          {reviewsLoading && (
            <div className="text-[#838383]">Loading reviews...</div>
          )}
          {reviewsError && (
            <div className="text-red-600">{reviewsError}</div>
          )}

          {!reviewsLoading && !reviewsError && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-[#585858]">No reviews yet. Be the first to write one!</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border rounded-xl p-4 mb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium flex-1">
                        {r.username ?? 'User'}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#838383]">
                          {r.date ? new Date(r.date).toLocaleString() : ''}
                        </span>
                        {currentUser && r.userId === currentUser.id && (
                          <>
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              disabled={deletingReviewId === r.id}
                              className="text-[#989898] hover:text-red-500 transition-colors p-1 -mr-1"
                              aria-label="Delete review"
                              title="Delete review"
                            >
                              {deletingReviewId === r.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </>
                        )}
                        {currentUser && (
                          <button
                            onClick={() => {
                              setReplyingToReviewId(r.id === replyingToReviewId ? null : r.id);
                              setReplyText("");
                            }}
                            className="text-[#989898] hover:text-blue-500 transition-colors p-1 -mr-1"
                            aria-label="Reply to review"
                            title="Reply to review"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={idx < (r.stars || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-[#dadada]'} 
                          size={16} 
                        />
                      ))}
                    </div>
                    <p className="text-[#2a2a2a] whitespace-pre-wrap">{r.description}</p>
                    
                    {/* Replies section */}
                    {r.replies && r.replies.length > 0 && (
                      <div className="mt-3 ml-6 pl-4 border-l-2 border-[#e7e7e7]">
                        <div className="space-y-3 mt-2">
                          {r.replies.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="font-medium text-sm">
                                  {reply.username ?? 'User'}
                                </div>
                                <span className="text-xs text-[#838383]">
                                  {reply.date ? new Date(reply.date).toLocaleString() : ''}
                                </span>
                              </div>
                              <p className="text-[#454545] text-sm">{reply.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {replyingToReviewId === r.id && (
                      <form onSubmit={(e) => handleSubmitReply(e, r.id)} className="mt-3 bg-gray-50 rounded-lg p-3">
                        <textarea
                          className="w-full border rounded-lg p-2 text-sm bg-white"
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          required
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setReplyingToReviewId(null)}
                            className="px-3 py-1 text-sm text-[#585858] hover:text-[#2a2a2a]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={postingReply || !replyText.trim()}
                            className={`px-3 py-1 text-sm rounded ${postingReply ? 'bg-[#989898]' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          >
                            {postingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Write a review */}
        <section className="bg-[#F8F8F8] rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-3">Write a review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm text-[#454545] mb-1">Your rating</label>
              <div className="flex items-center gap-2">
                {([1,2,3,4,5] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewReviewStars(val)}
                    className="text-2xl focus:outline-none"
                    aria-label={`Rate ${val} star${val>1?'s':''}`}
                  >
                    <Star 
                      className={val <= newReviewStars ? 'text-yellow-500 fill-yellow-500' : 'text-[#dadada]'} 
                      size={20} 
                    />
                  </button>
                ))}
                <span className="text-sm text-[#585858]">{newReviewStars}/5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#454545] mb-1">Your review</label>
              <textarea
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dadada]"
                rows={4}
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={postingReview || !newReviewText.trim()}
                className={`px-5 py-2 rounded-full text-white ${postingReview ? 'bg-[#989898]' : 'bg-[#282828] hover:opacity-90'} transition`}
              >
                {postingReview ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center select-none"
          onClick={closeLightbox}
          onWheel={(e) => {
            e.stopPropagation();
            if (zoom > 1) {
              // Zoom with wheel when zoomed in
              setZoom((z) => {
                const next = e.deltaY < 0 ? Math.min(4, +(z + 0.15).toFixed(2)) : Math.max(1, +(z - 0.15).toFixed(2));
                if (next === 1) setOffset({ x: 0, y: 0 });
                return next;
              });
              return;
            }
            const now = Date.now();
            if (now - wheelCooldownRef.current < 300) return;
            wheelCooldownRef.current = now;
            if (e.deltaY > 0) showNext(); else showPrev();
          }}
        >
          {/* Content wrapper to prevent closing when interacting with controls */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (zoom === 1) return;
              setIsPanning(true);
              panStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
            }}
            onMouseMove={(e) => {
              if (!isPanning || !panStartRef.current) return;
              setOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
            }}
            onMouseUp={() => { setIsPanning(false); panStartRef.current = null; }}
            onMouseLeave={() => { setIsPanning(false); panStartRef.current = null; }}
          >
            {/* Close button */}
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev button */}
            {images.length > 1 && (
              <button
                aria-label="Previous"
                className="absolute left-4 md:left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
                onClick={showPrev}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                aria-label="Next"
                className="absolute right-4 md:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
                onClick={showNext}
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <img
              src={images[activeImageIdx]}
              alt={`image-${activeImageIdx}`}
              className="max-w-[95vw] max-h-[90vh] object-contain cursor-grab"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transition: isPanning ? 'none' : 'transform 0.12s ease-out' }}
              onDoubleClick={() => {
                if (zoom === 1) setZoom(2); else resetZoom();
              }}
              onMouseDown={() => {
                // indicate panning
              }}
            />

            {/* Zoom controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
              <button onClick={zoomOut} className="px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">-</button>
              <span className="px-2 text-white text-sm">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} className="px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">+</button>
              {zoom > 1 && (
                <button onClick={resetZoom} className="ml-1 px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30">Reset</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
