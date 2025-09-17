import React, { useEffect, useMemo, useState } from "react";
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

  if (loading) return <div className="p-6 text-center">Завантаження товару...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!product) return <div className="p-6 text-center">Товар не знайдено</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="w-full">
          <div className="w-full h-[80vh] rounded-2xl overflow-hidden border bg-white">
            <img src={images[activeImageIdx]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => setActiveImageIdx(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border ${idx === activeImageIdx ? "border-black" : "border-gray-200"}`}>
                  <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
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

          <p className="text-2xl font-semibold">{product.price.toLocaleString()} ₴</p>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
              Додати в кошик
            </button>
            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.74 0-3.278 1.012-4.062 2.475A4.875 4.875 0 008.25 3.75C5.66 3.75 3.563 5.765 3.563 8.25c0 7.22 8.437 11.25 8.437 11.25s8.438-4.03 8.438-11.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
