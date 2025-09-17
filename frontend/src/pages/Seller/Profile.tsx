import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicSellerProfileBySlug, fetchPublicSellerProductsBySlug } from "../../api/seller";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import type { PageResponse } from "../../types/pageresponse";
import type { SellerStats } from "../../types/sellerstats";
import ProductCard from "../ProductCard";
import { motion } from "framer-motion";
import Heart from "lucide-react";

export default function SellerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setError("Seller slug is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load public seller profile
        const sellerData = await fetchPublicSellerProfileBySlug(slug);
        setSeller(sellerData);

        // Load public seller products
        const productsData = await fetchPublicSellerProductsBySlug(slug, 0, 12);
        setProducts(productsData.content || []);
      } catch (err) {
        console.error("Loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load seller data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!seller) return <div className="p-6 text-center">Seller not found</div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1332px] mx-auto py-8 px-6">
        {seller.banner && (
          <div className="rounded-2xl overflow-hidden mb-8 h-[232px]">
            <img src={seller.banner} alt="banner" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6 mb-8">
          {seller.avatar && (
            <img src={seller.avatar} alt="avatar" className="w-[83px] h-[83px] rounded-full object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{seller.username}</h1>
            {seller.description && <p className="text-sm text-gray-500">{seller.description}</p>}
          </div>
        </div>

        {/* Stats Section - Only show for authenticated seller viewing their own profile */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Your Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                <div className="text-sm text-gray-600">Completed Orders</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.activeOrders}</div>
                <div className="text-sm text-gray-600">Active Orders</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Filters</h3>
            </div>
          </aside>

          <main className="col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  imageUrl={
                    product.pictures && product.pictures.length > 0
                      ? `http://localhost:8080/${product.pictures[0].url}`
                      : "/images/product/placeholder.jpg"
                  }
                  title={product.name}
                  price={`$${product.price.toFixed(2)}`}
                  className="h-full"
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Showing {products.length} item(s)
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
