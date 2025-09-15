import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { 
  fetchSellerProfile, 
  fetchSellerProducts, 
  fetchPublicSellerProfile, 
  fetchPublicSellerProducts,
  fetchSellerStats
} from "../../api/seller";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import type { PageResponse } from "../../types/pageresponse";
import type { SellerStats } from "../../types/sellerstats";
import ProductCard from "../ProductCard";

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isOwnProfile = !id && auth?.user?.roleName === "SELLER";
  const sellerId = id ? parseInt(id) : (auth?.user?.id || 0);
  const visibleProducts = products.slice(0, (currentPage + 1) * 12);

  useEffect(() => {
    const loadData = async () => {
      if (auth?.loading) return;

      if (isOwnProfile && (!auth?.user?.id || auth?.user?.roleName !== "SELLER")) {
        setError("You must be a seller to view your profile");
        setLoading(false);
        return;
      }
      
      if (!isOwnProfile && !id) {
        setError("Seller ID is required");
        setLoading(false);
        return;
      }
      
      if (!sellerId || sellerId <= 0) {
        setError("Invalid seller ID");
        setLoading(false);
        return;
      }

      try {
        let sellerData: Seller;
        let productsData: PageResponse<Product>;
        let statsData: SellerStats | null = null;

        if (isOwnProfile) {
          [sellerData, productsData, statsData] = await Promise.all([
            fetchSellerProfile(),
            fetchSellerProducts(sellerId, 0, 12),
            fetchSellerStats().catch(() => null)
          ]);
        } else {
          [sellerData, productsData] = await Promise.all([
            fetchPublicSellerProfile(sellerId),
            fetchPublicSellerProducts(sellerId, 0, 12)
          ]);
        }
        
        setSeller(sellerData);
        setProducts(productsData.content || []);
        setTotalPages(productsData.totalPages || 0);
        setStats(statsData);
      } catch (err: any) {
        console.error("Loading error:", err);
        setError(err.message || "Failed to load seller data");
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [auth?.loading, auth?.user?.id, auth?.user?.roleName, id, isOwnProfile, sellerId]);

  const loadMoreProducts = async () => {
    if (currentPage >= totalPages - 1) return;

    try {
      const nextPage = currentPage + 1;
      let productsData: PageResponse<Product>;

      if (isOwnProfile) {
        productsData = await fetchSellerProducts(sellerId, nextPage, 12);
      } else {
        productsData = await fetchPublicSellerProducts(sellerId, nextPage, 12);
      }
      
      setProducts(prev => [...prev, ...(productsData.content || [])]);
      setCurrentPage(nextPage);
    } catch (err: any) {
      console.error("Error loading more products:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Seller Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The seller you're looking for doesn't exist."}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1332px] mx-auto py-8 px-6">
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
              <p className="text-sm text-gray-500 mt-2">{seller.description}</p>
            )}
            {seller.rating && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-gray-600">{seller.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => window.location.href = "/seller/edit"}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => window.location.href = "/seller/dashboard"}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                  Share
                </button>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                  Contact Seller
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {isOwnProfile && stats && (
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
          {/* Sidebar */}
          <aside className="col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="mb-4 text-2xl">Categories</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#">Furniture</a></li>
                <li><a href="#">For Kitchen</a></li>
                <li><a href="#">For Backyard</a></li>
                <li><a href="#">For Kids</a></li>
                <li><a href="#">Electronics</a></li>
                <li><a href="#">Best</a></li>
              </ul>

              <div className="mt-6">
                <h4 className="text-sm text-gray-600 mb-2">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>$20.00 – $50.00</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>$50.00 – $100.00</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="col-span-10">
            <h2 className="text-3xl font-bold mb-6">
              {isOwnProfile ? "My Products" : "All Items"} ({products.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
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
                Showing {currentPage * 12 + 1}–
                {Math.min((currentPage + 1) * 12, products.length)} of {products.length} item(s)
              </p>
              {currentPage < totalPages - 1 && (
                <button
                  onClick={loadMoreProducts}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Load More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
