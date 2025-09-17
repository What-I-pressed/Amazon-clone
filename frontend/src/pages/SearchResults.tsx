import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProducts } from '../api/search';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);

  const query = useQuery();
  const searchTerm = query.get('query') || '';

  const categories = [
    'Furniture',
    'For Kitchen',
    'For Bedroom',
    'For Kids',
    'Electronics',
    'Tools'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await searchProducts(searchTerm, 0, 100);
        setProducts(results.content || []);
      } catch (err) {
        setError('Failed to fetch search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] text-red-500">{error}</div>
  );
  if (products.length === 0) return (
    <div className="flex items-center justify-center min-h-[400px] text-gray-500">No products found.</div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className={`${showFilters ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-64 bg-white`}>
        <div className="p-6">
          <div className="lg:hidden flex justify-end mb-4">
            <button onClick={() => setShowFilters(false)} className="p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-8">
            <h3 className="text-3xl text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors ${
                      selectedCategory === cat
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
            <div className="px-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>$0.00</span>
                <span>$500.00</span>
              </div>
              <div className="relative h-2">
                <div className="absolute w-full h-0.5 bg-gray-300 top-1/2 transform -translate-y-1/2"></div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceMin} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= priceMax) setPriceMin(val);
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 2 }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceMax} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= priceMin) setPriceMax(val);
                  }}
                  className="absolute w-full appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Items</h1>
            {searchTerm && <p className="text-sm text-gray-500 mt-1">Search results for: "{searchTerm}"</p>}
          </div>
          <button onClick={() => setShowFilters(true)} className="lg:hidden p-2 rounded-md border border-gray-200">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Showing 1-{Math.min(visibleCount, products.length)} of {products.length} item(s)
        </p>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {(() => {
                  const primary = product.pictures?.find(p => p.pictureType === 'PRIMARY') || product.pictures?.[0];
                  const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : '/images/product/placeholder.jpg';
                  return (
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      imageUrl={imgUrl}
                      title={product.name || ''}
                      price={`$${Number(product.price).toLocaleString()}`}
                    />
                  );
                })()}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMore && (
          <div className="mt-12 mb-8 flex justify-center">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;