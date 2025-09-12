import { useEffect, useState } from "react";
import { fetchSellerProfile, fetchSellerProducts } from "../../api/seller";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import ProductCard from "../ProductCard";

export default function App() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sellerData = await fetchSellerProfile();
        setSeller(sellerData);

        const productsData = await fetchSellerProducts();
        setProducts(productsData);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!seller) {
    return <div className="p-6 text-center">Seller not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1332px] mx-auto py-8 px-6">
        {/* Banner */}
        {seller.banner && (
          <div className="rounded-2xl overflow-hidden mb-8 h-[232px]">
            <img
              src={seller.banner}
              alt="banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Seller Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6 mb-8">
          {seller.avatar && (
            <img
              src={seller.avatar}
              alt="avatar"
              className="w-[83px] h-[83px] rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{seller.username}</h1>
            {seller.description && (
              <p className="text-sm text-gray-500">{seller.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg">Share</button>
            <button className="px-4 py-2 bg-black text-white rounded-lg">
              Go to catalog
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">In stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Discount</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">New arrivals</span>
                </label>
              </div>

              <div className="mt-6">
                <h4 className="text-sm text-gray-600 mb-2">Price</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="from"
                    className="w-1/2 p-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="to"
                    className="w-1/2 p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <main className="col-span-9">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">All products</h2>
                  <p className="text-sm text-gray-500">
                    Found: {products.length}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Search"
                  />
                  <select className="px-3 py-2 border rounded-lg">
                    <option>Popular</option>
                    <option>Price</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  imageUrl={product.images?.[0] || "/public/product/card-01.jpg"}
                  title={product.name}
                  price={`$${product.price.toFixed(2)}`}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
