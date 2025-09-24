import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product } from "../types/product";
import type { Seller } from "../types/seller";
import { fetchProductBySlug } from "../api/products";
import { fetchSellerProfileBySlug } from "../api/seller";

import { fetchProductReviews, createReview, deleteReview, type Review as ProductReview } from "../api/reviews";
import { AuthContext } from "../context/AuthContext";
import { Heart, Star, ArrowLeft, ArrowRight, X, Truck, Package } from 'lucide-react';
import { addToCart as addToCartApi, fetchCart } from "../api/cart";
import { addFavourite, deleteFavourite, fetchFavourites } from "../api/favourites";


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

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [postingReview, setPostingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const auth = useContext(AuthContext);
  const currentUser = auth?.user || null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
        // load favourite state for this product
        try {
          const favs = await fetchFavourites();
          if (!isMounted) return;
          const match = favs.find((f) => f.product?.id === productData.id);
          if (match) {
            setLiked(true);
            setFavouriteId(match.id);
          } else {
            setLiked(false);
            setFavouriteId(null);
          }
        } catch {
          // ignore favourites load error silently
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

  // Load reviews when product is available
  useEffect(() => {
    const loadReviews = async () => {
      if (!product?.id) return;
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const list = await fetchProductReviews(product.id);
        // Sort by date desc if date exists
        const sorted = [...list].sort((a, b) => {
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
    };
    loadReviews();
  }, [product?.id]);

  const handleDeleteReview = async (reviewId: number) => {
    if (!product?.id || !window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
    
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Не вдалося видалити відгук. Спробуйте пізніше.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    if (!newReviewText.trim()) return;
    setPostingReview(true);
    try {
      await createReview({
        productId: product.id,
        description: newReviewText.trim(),
        stars: newReviewStars,
      });
      setNewReviewText("");
      setNewReviewStars(5);
      // Reload reviews
      const list = await fetchProductReviews(product.id);
      const sorted = [...list].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      });
      setReviews(sorted);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Не вдалося додати відгук");
    } finally {
      setPostingReview(false);
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
      } else {
        if (favouriteId != null) {
          await deleteFavourite(favouriteId);
        }
        setFavouriteId(null);
        setLiked(false);
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

  if (loading) return <div className="p-6 text-center">Завантаження товару...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!product) return <div className="p-6 text-center">Товар не знайдено</div>;

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
          <h1 className="text-3xl font-bold pr-12">{product.name}</h1>
          <p className="text-2xl font-semibold">${product.price.toLocaleString()}</p>
          
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
          
          <p className="text-gray-700 leading-relaxed">
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
              disabled={addingCart}
              className="flex-1 bg-[#42A275] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition"
            >
              {addingCart ? "Adding..." : inCartQty > 0 ? `In cart (${inCartQty})` : "Add to cart"}
            </button>
            <button
              onClick={toggleFavourite}
              title={liked ? "Remove from favourites" : "Add to favourites"}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={liked ? "red" : "none"} viewBox="0 0 24 24" strokeWidth={1.8} stroke={liked ? "red" : "currentColor"} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.74 0-3.278 1.012-4.062 2.475A4.875 4.875 0 008.25 3.75C5.66 3.75 3.563 5.765 3.563 8.25c0 7.22 8.437 11.25 8.437 11.25s8.438-4.03 8.438-11.25z" />
              </svg>
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
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
            <div className="text-gray-500">Loading reviews...</div>
          )}
          {reviewsError && (
            <div className="text-red-600">{reviewsError}</div>
          )}

          {!reviewsLoading && !reviewsError && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-gray-600">No reviews yet. Be the first to write one!</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium flex-1">
                        {r.username ?? 'User'}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {r.date ? new Date(r.date).toLocaleString() : ''}
                        </span>
                        {currentUser && r.userId === currentUser.id && (
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            disabled={deletingReviewId === r.id}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
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
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={idx < (r.stars || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
                          size={16} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{r.description}</p>
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
              <label className="block text-sm text-gray-700 mb-1">Your rating</label>
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
                      className={val <= newReviewStars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
                      size={20} 
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-600">{newReviewStars}/5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Your review</label>
              <textarea
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                className={`px-5 py-2 rounded-full text-white ${postingReview ? 'bg-gray-400' : 'bg-[#282828] hover:opacity-90'} transition`}
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