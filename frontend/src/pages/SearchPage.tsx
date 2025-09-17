// src/pages/SearchPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Product } from "../types/product";
import { fetchProductsBySearch } from "../api/products";

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductsBySearch(query);
        setProducts(data);
      } catch (err) {
        setError("Не вдалось завантажити продукти по пошуку");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Результаты поиска: {query}</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>Nothing found for"{query}"</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={product.pictures[0].url}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
