import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../types/product";
import { fetchProductById } from "../api/products";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

const buttonBase =
  "bg-[#42A275] text-white font-semibold px-6 py-4 rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:brightness-110 active:scale-95";

const secondaryButton =
  "w-full py-4 border border-black rounded-full font-semibold text-black hover:bg-gray-100 transition-all duration-300 active:scale-95";

const TabsReviews: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: Product;
}> = ({ activeTab, setActiveTab, product }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 mt-12">
      <div className="flex gap-6 border-b relative">
        {["description", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`pb-3 text-lg font-semibold relative ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-black transition"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "description" ? "Description" : "Reviews"}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-underline"
                className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-black"
              />
            )}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === "description" ? (
          <p className="text-gray-700">{product.description}</p>
        ) : (
          <div>
            <p className="text-gray-700">User reviews will appear here.</p>
            <form className="mt-4 flex flex-col gap-3">
              <textarea
                placeholder="Write your review..."
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#42A275] transition"
              />
              <button className={buttonBase}>Submit</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [qty, setQty] = useState<number>(1);
  const [wishlist, setWishlist] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    if (!id) {
      setError("Відсутній ідентифікатор товару");
      setLoading(false);
      return;
    }

    fetchProductById(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        setActiveImageIdx(0);
      })
      .catch((e: unknown) => {
        if (!isMounted) return;
        setError(
          e instanceof Error ? e.message : "Сталася помилка завантаження товару"
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const images: string[] = useMemo(() => {
    if (product?.pictures && product.pictures.length > 0) {
      return product.pictures.map(
        (picture) => `http://localhost:8080/${picture.url}`
      );
    }
    return ["/images/product/placeholder.jpg"];
  }, [product]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        setActiveImageIdx((prev) => (prev + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto">Завантаження товару...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-5xl mx-auto text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="p-6 max-w-5xl mx-auto">Товар не знайдено</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        Product Listing &gt; Dummy Product Page
      </div>

      <div className="flex gap-10">
        {/* Left thumbnails */}
        <div className="flex flex-col gap-3 w-24">
          {images.map((img, idx) => (
            <motion.img
              whileHover={{ scale: 1.05 }}
              key={idx}
              src={img}
              alt={`thumbnail-${idx}`}
              className={`w-24 h-24 object-cover rounded-lg cursor-pointer border ${
                activeImageIdx === idx ? "border-black" : "border-gray-300"
              }`}
              onClick={() => setActiveImageIdx(idx)}
            />
          ))}
        </div>

        {/* Main Image */}
        <motion.div
          className="flex-shrink-0 w-[500px] overflow-hidden rounded-2xl shadow cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={images[activeImageIdx]}
            alt={product.name}
            className="w-full h-auto"
          />
        </motion.div>

        {/* Right Product Info */}
        <div className="flex-1 relative">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Price + Stars */}
          <div className="flex items-center gap-3 mb-6">
            <p className="text-2xl font-semibold">${product.price}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setRating(star)}
                >
                  ★
                </motion.span>
              ))}
              <span className="ml-2 text-gray-500 text-sm">(32)</span>
            </div>
          </div>

          {/* Wishlist */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setWishlist(!wishlist)}
            className="absolute top-0 right-0"
          >
            <Heart
              className={`w-7 h-7 ${
                wishlist ? "fill-red-500 stroke-red-500" : "stroke-gray-400"
              } transition`}
            />
          </motion.button>

          {/* Seller Card */}
          <div className="flex items-center justify-between p-4 border rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <p className="font-medium">{product.sellerName || 'Unknown Seller'}</p>
            </div>
            {product.sellerId && (
              <button 
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-black transition"
                onClick={() => window.location.href = `/seller/${product.sellerId}`}
              >
                Show More <span>›</span>
              </button>
            )}
          </div>

          <hr className="mb-6" />

          <p className="text-gray-600 mb-6">
            Upgrade your bedroom with this elegant double bed and matching side
            tables. Crafted from high-quality wood with a modern design, it
            combines comfort and style to enhance your living space.
          </p>

          <ul className="list-disc list-inside text-gray-600 mb-8 space-y-1">
            <li>Sturdy wooden construction with sleek finish</li>
            <li>Includes two side tables with built-in drawers</li>
            <li>Ideal for modern or contemporary bedroom decor</li>
          </ul>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex border rounded-full overflow-hidden">
              <button
                className="px-4 py-2 hover:bg-gray-100 transition"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <div className="px-5 py-2">{qty}</div>
              <button
                className="px-4 py-2 hover:bg-gray-100 transition"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} className={buttonBase}>
              Add to Cart
            </motion.button>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} className={secondaryButton}>
            Buy Now
          </motion.button>

          {/* Shipping info заглушки */}
          <div className="text-gray-500 text-sm space-y-2 mt-6">
            <p>🚚 Free worldwide shipping on all orders over $100</p>
            <p>⏱ Delivers in: 3–7 Working Days</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabsReviews
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        product={product}
      />

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
  {isFullscreen && (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      <button
        className="absolute top-6 right-6 text-white"
        onClick={() => setIsFullscreen(false)}
      >
        <X className="w-8 h-8" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          className="absolute left-6 text-white text-4xl hover:text-gray-300 transition"
          onClick={() =>
            setActiveImageIdx(
              (prev) => (prev - 1 + images.length) % images.length
            )
          }
        >
          ‹
        </button>
      )}

      {/* Fullscreen carousel */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <motion.img
          key={activeImageIdx}
          src={images[activeImageIdx]}
          alt="fullscreen"
          className="max-h-[85%] max-w-[85%] rounded-xl shadow-lg select-none"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeInOut" },
          }}
          exit={{
            scale: 0.9,
            opacity: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x > 100 || velocity.x > 500) {
              setActiveImageIdx(
                (prev) => (prev - 1 + images.length) % images.length
              );
            } else if (offset.x < -100 || velocity.x < -500) {
              setActiveImageIdx((prev) => (prev + 1) % images.length);
            }
          }}
        />
      </motion.div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-6 text-white text-4xl hover:text-gray-300 transition"
          onClick={() =>
            setActiveImageIdx((prev) => (prev + 1) % images.length)
          }
        >
          ›
        </button>
      )}
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default ProductPage;
