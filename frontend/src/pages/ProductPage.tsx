import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product } from "../types/product";
import type { Seller } from "../types/seller";
import { fetchProductBySlug } from "../api/products";
import { fetchSellerProfileBySlug } from "../api/seller";

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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="w-full">
          <div className="w-full h-[50vh] rounded-2xl overflow-hidden border bg-white flex items-center justify-center">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="max-w-full max-h-full object-contain cursor-zoom-in"
              onClick={() => openLightbox(activeImageIdx)}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => setActiveImageIdx(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border bg-white ${idx === activeImageIdx ? "border-black" : "border-gray-200"}`}>
                  <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Seller Info Above Description */}
          {seller && (
            <Link to={`/seller/${seller.slug}`} className="block mt-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4">
                {seller.url && <img src={`http://localhost:8080/${seller.url}`} alt={seller.username} className="w-16 h-16 rounded-full object-cover" />}
                <div>
                  <p className="font-semibold text-lg">{seller.username}</p>
                  {seller.description && <p className="text-sm text-gray-500">{seller.description}</p>}
                </div>
              </div>
            </Link>
          )}

          <p className="text-2xl font-semibold">$ {product.price.toLocaleString()}</p>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-[#282828] text-white rounded-3xl py-2.5 font-medium hover:opacity-90 transition">
              Add to cart
            </button>
            <button className="w-10 h-10 rounded-full border bg-gray-300 border-gray-200 flex items-center justify-center hover:bg-gray-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.74 0-3.278 1.012-4.062 2.475A4.875 4.875 0 008.25 3.75C5.66 3.75 3.563 5.765 3.563 8.25c0 7.22 8.437 11.25 8.437 11.25s8.438-4.03 8.438-11.25z" />
              </svg>
            </button>
          </div>
        </div>
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
              ✕
            </button>

            {/* Prev button */}
            {images.length > 1 && (
              <button
                aria-label="Previous"
                className="absolute left-4 md:left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
                onClick={showPrev}
              >
                ‹
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                aria-label="Next"
                className="absolute right-4 md:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
                onClick={showNext}
              >
                ›
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
