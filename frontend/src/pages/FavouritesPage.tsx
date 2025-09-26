import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFavourites, deleteFavourite, type FavouriteItem } from "../api/favourites";
import { addToCart } from "../api/cart";

const FavouritesPage: React.FC = () => {
  const [items, setItems] = useState<FavouriteItem[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    load();
  }, []);

  const handleRemove = async (favId: number) => {
    try {
      setLoading(true);
      await deleteFavourite(favId);
      setItems(prev => prev.filter(i => i.id !== favId));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося видалити зі списку обраного");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      setLoading(true);
      await addToCart({ productId, quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Не вдалося додати до кошика");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 className="text-4xl font-bold mb-2">Favorite</h1>
      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {items.length === 0 && !loading ? (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <div className="text-lg font-semibold mb-1">Список обраного порожній</div>
          <div className="text-gray-600 mb-4">Додайте товари до обраного, щоб швидко знаходити їх пізніше</div>
          <a href="/catalog" className="inline-block px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800">Перейти в каталог</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mt-6">
          {items.map((it) => {
            const primary = it.product?.pictures?.find(p => p.pictureType === 'PRIMARY') || it.product?.pictures?.[0];
            const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : undefined;
            return (
            <div
              key={it.id}
              className="border rounded-2xl p-6 bg-white flex flex-col gap-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => it.product?.slug && navigate(`/product/${it.product.slug}`)}
              role={it.product?.slug ? 'button' : undefined}
              tabIndex={it.product?.slug ? 0 : undefined}
            >
              <div className="flex gap-5 items-center">
                <div className="w-32 h-32 flex-shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={it.product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-lg font-semibold leading-snug break-words"
                    style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {it.product?.name}
                  </div>
                  <div className="text-gray-900 font-semibold text-base mt-1">{it.product?.price?.toFixed(2)} грн</div>
                </div>
              </div>
              <div className="flex gap-3 mt-auto pt-2">
                <button
                  className="flex-1 bg-gray-900 text-white rounded-full py-3 text-sm hover:bg-gray-800 disabled:opacity-50"
                  onClick={(e) => { e.stopPropagation(); it.product?.id && handleAddToCart(Number(it.product.id)); }}
                  disabled={loading}
                >
                  Додати до кошика
                </button>
                <button
                  className="px-4 py-3 rounded-full border text-sm hover:bg-gray-50 disabled:opacity-50"
                  onClick={(e) => { e.stopPropagation(); handleRemove(it.id); }}
                  disabled={loading}
                >
                  Видалити
                </button>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
