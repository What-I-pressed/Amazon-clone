import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFavourites, type FavouriteItem } from "../api/favourites";
import { AuthContext } from "../context/AuthContext";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

const FavouritesPage: React.FC = () => {
  const [items, setItems] = useState<FavouriteItem[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("FavouritesPage must be used within AuthProvider");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFavourites();
      setItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося завантажити обране");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    load();
  }, [auth.loading, auth.isAuthenticated]);

  const buildProductFromFavourite = (fav: FavouriteItem): Product | null => {
    if (!fav.product) return null;

    const product: Product = {
      ...fav.product,
      id: Number(fav.product.id),
      slug: fav.product.slug ?? String(fav.product.id),
      price: fav.product.price ?? 0,
      priceWithoutDiscount: fav.product.priceWithoutDiscount ?? fav.product.price ?? undefined,
      discountPercentage: fav.product.discountPercentage ?? undefined,
      rating: fav.product.rating ?? undefined,
      views: fav.product.views ?? undefined,
      quantityInStock: fav.product.quantityInStock ?? undefined,
      pictures: fav.product.pictures ?? [],
      description: fav.product.description ?? "",
      createdAt: fav.product.createdAt ?? undefined,
      updatedAt: fav.product.updatedAt ?? undefined,
      sellerId: fav.product.sellerId ?? undefined,
      categoryId: fav.product.categoryId ?? undefined,
      categoryName: fav.product.categoryName ?? undefined,
      subcategoryId: fav.product.subcategoryId ?? undefined,
      subcategoryName: fav.product.subcategoryName ?? undefined,
    };

    return product;
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <h1 className="text-4xl font-bold mb-2">Favorite</h1>
      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {items.length === 0 && !loading ? (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <div className="text-lg font-semibold mb-1">Список обраного порожній</div>
          <div className="text-[#585858] mb-4">Додайте товари до обраного, щоб швидко знаходити їх пізніше</div>
          <a href="/catalog" className="inline-block px-5 py-2 rounded-full bg-[#151515] text-white hover:bg-[#2a2a2a]">Перейти в каталог</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6 justify-items-center">
          {items.map((it) => {
            const product = buildProductFromFavourite(it);
            if (!product) return null;

            const primaryImage = product.pictures?.find(p => p.pictureType === 'PRIMARY') || product.pictures?.[0];
            const imageUrl = primaryImage?.url ?? '';
            const price = product.price != null ? `$${Number(product.price).toFixed(2)}` : '—';
            const oldPrice = product.priceWithoutDiscount != null ? `$${Number(product.priceWithoutDiscount).toFixed(2)}` : undefined;
            const discountPercent = product.discountPercentage != null ? `-${Math.round(product.discountPercentage)}%` : undefined;

            return (
              <ProductCard
                key={product.id ?? it.id}
                id={product.id}
                slug={product.slug}
                imageUrl={imageUrl}
                title={product.name || ''}
                price={price}
                oldPrice={oldPrice}
                discountPercent={discountPercent}
                quantityInStock={product.quantityInStock}
                className="w-full max-w-[20rem]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
