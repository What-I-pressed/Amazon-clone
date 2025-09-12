import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../types/product";
import { fetchProductById } from "../api/products";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

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
        setError(e instanceof Error ? e.message : "Сталася помилка завантаження товару");
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
      return product.pictures.map(picture => `http://localhost:8080/${picture.url}`);
    }
    return ["/images/product/placeholder.jpg"]; // fallback to a placeholder
  }, [product]);

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border ${
                    idx === activeImageIdx ? "border-black" : "border-gray-200"
                  }`}
                >
                  <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {product.price.toLocaleString()} ₴
            </p>
          </div>
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-[#282828] text-white rounded-xl py-3 font-medium hover:opacity-90 transition">
              Додати в кошик
            </button>
            <button className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
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
    </div>
  );
};

export default ProductPage;
