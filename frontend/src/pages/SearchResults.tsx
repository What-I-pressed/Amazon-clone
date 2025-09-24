import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProductsWithFilter, type ProductFilterDto } from '../api/search';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';
import ProductFilters, { type ProductFiltersState } from '../components/filters/ProductFilters';

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersState>({}); // applied filters
  const [pendingFilters, setPendingFilters] = useState<ProductFiltersState>({}); // edited but not applied yet
  const [applyKey, setApplyKey] = useState(0); // increments when Apply is pressed

  // Stable callback to prevent ProductFilters effect loops
  const handleFiltersChange = useCallback((next: ProductFiltersState) => {
    // Store edits without triggering fetch
    setPendingFilters((prev) => {
      const prevStr = JSON.stringify(prev ?? {});
      const nextStr = JSON.stringify(next ?? {});
      if (prevStr === nextStr) return prev;
      return next;
    });
  }, []);

  const applyFiltersNow = useCallback(() => {
    setFilters((prev) => {
      const prevStr = JSON.stringify(prev ?? {});
      const nextStr = JSON.stringify(pendingFilters ?? {});
      if (prevStr === nextStr) return prev;
      return pendingFilters;
    });
    setApplyKey((k) => k + 1);
  }, [pendingFilters]);

  const query = useQuery();
  const searchTerm = query.get('query') || '';

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: ProductFilterDto = {
          name: searchTerm || undefined,
          lowerPriceBound: filters.lowerPriceBound ?? undefined,
          upperPriceBound: filters.upperPriceBound ?? undefined,
          // Note: categoryId not wired yet; backend filters by categoryId only.
          characteristics: filters.characteristics ?? undefined,
        };
        const sort = filters.sortField && filters.sortDir ? `${filters.sortField},${filters.sortDir}` : undefined;
        const results = await searchProductsWithFilter(payload, 0, 100, controller.signal, sort);
        setProducts(results.content || []);
      } catch (err: any) {
        // Ignore cancellations
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setError('Failed to fetch search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm, applyKey]);

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
          <ProductFilters
            initial={{}}
            onChange={handleFiltersChange}
          />
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={applyFiltersNow}
              className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => { setPendingFilters({}); setFilters({}); setApplyKey((k)=>k+1); }}
              className="px-4 py-2 rounded-md border text-sm"
            >
              Reset
            </button>
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