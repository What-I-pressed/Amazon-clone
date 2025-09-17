import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSellerProfileBySlug, fetchSellerProductsBySlug } from "../../api/seller";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import ProductCard from "../ProductCard";

export default function SellerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        const sellerData = await fetchSellerProfileBySlug(slug);
        setSeller(sellerData);

        const productsPage = await fetchSellerProductsBySlug(slug, 0, 12);
        setProducts(productsPage.content || []);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!seller) {
    return <div className="p-6 text-center">Seller not found</div>;
  }

  const avatarUrl = seller.url
    ? `http://localhost:8080/${seller.url}`
    : seller.url
    ? seller.url
    : "/images/avatar-placeholder.png";

  return (
    <div className="min-h-screen">
      <div className="max-w-[1332px] mx-auto py-8 px-6">
        {/* Banner */}
        {seller.banner && (
          <div className="rounded-2xl overflow-hidden mb-8 h-[232px] bg-white flex items-center justify-center">
            <img
              src={seller.banner}
              alt="banner"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6 mb-8">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-[83px] h-[83px] rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{seller.username}</h1>
            {seller.description && (
              <p className="text-sm text-gray-500">{seller.description}</p>
            )}
          </div>
        </div>

         {/* Products */}
        <main className="col-span-9">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Товари продавця</h2>
                <p className="text-sm text-gray-500">Знайдено: {products.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`}>
                <ProductCard
                  id={product.id}
                  imageUrl={
                    product.pictures && product.pictures.length > 0
                      ? `http://localhost:8080/${product.pictures[0].url}`
                      : "/images/product/placeholder.jpg"
                  }
                  title={product.name}
                  price={`$${product.price.toFixed(2)}`}
                />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
