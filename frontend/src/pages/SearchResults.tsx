import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProductsWithFilter, type ProductFilterDto } from '../api/search';
import ProductCard from './ProductCard';
import type { Product } from '../types/product';
import ProductFilters, { type ProductFiltersState } from '../components/filters/ProductFilters';

const sortProducts = (items: Product[], sortField: ProductFiltersState['sortField'], sortDir: ProductFiltersState['sortDir']) => {
  if (!sortField || !sortDir) return items;
  const direction = sortDir === 'desc' ? -1 : 1;

  const getComparableValue = (product: Product) => {
    switch (sortField) {
      case 'price':
        if (Number.isFinite(product.price)) return Number(product.price);
        if (sortDir === 'asc') {
          return Number.isFinite(product.priceWithoutDiscount) ? Number(product.priceWithoutDiscount) : Number.POSITIVE_INFINITY;
        }
        return Number.isFinite(product.priceWithoutDiscount) ? Number(product.priceWithoutDiscount) : 0;
      case 'avgRating':
        return Number(product.rating ?? 0);
      case 'views':
        return Number(product.views ?? 0);
      default:
        return 0;
    }
  };

  return [...items].sort((a, b) => {
    const aVal = getComparableValue(a);
    const bVal = getComparableValue(b);
    if (aVal === bVal) return 0;
    return aVal > bVal ? direction : -direction;
  });
};

const extractComparablePrice = (product: Product): number | null => {
  const primary = typeof product.price === 'number' ? product.price : Number(product.price);
  if (Number.isFinite(primary)) return Number(primary);
  const fallback = typeof product.priceWithoutDiscount === 'number' ? product.priceWithoutDiscount : Number(product.priceWithoutDiscount);
  if (Number.isFinite(fallback)) return Number(fallback);
  return null;
};

const filterProducts = (items: Product[], filters: ProductFiltersState) => {
  const lower = typeof filters.lowerPriceBound === 'number' ? filters.lowerPriceBound : null;
  const upper = typeof filters.upperPriceBound === 'number' ? filters.upperPriceBound : null;
  if (lower == null && upper == null) return items;

  return items.filter((product) => {
    const price = extractComparablePrice(product);
    if (price == null) return false;
    if (lower != null && price < lower) return false;
    if (upper != null && price > upper) return false;
    return true;
  });
};

const prepareProducts = (items: Product[], filters: ProductFiltersState) => {
  const filtered = filterProducts(items, filters);
  return sortProducts(filtered, filters.sortField, filters.sortDir);
};

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  // Default/empty filters object
  const emptyFilters: ProductFiltersState = {
    lowerPriceBound: null,
    upperPriceBound: null,
    characteristics: null,
    sortField: null,
    sortDir: null,
  };
  const [filters, setFilters] = useState<ProductFiltersState>(emptyFilters); // applied filters
  const [pendingFilters, setPendingFilters] = useState<ProductFiltersState>(emptyFilters); // edited but not applied yet
  const [applyKey, setApplyKey] = useState(0); // increments when Apply is pressed
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const [nextSearchPage, setNextSearchPage] = useState(0);
  const [hasMoreSearchPages, setHasMoreSearchPages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  const searchTerm = useMemo(() => query.get('query') || '', [query]);
  const subcategoryId = useMemo(() => {
    const val = query.get('subcategoryId');
    return val ? Number(val) : undefined;
  }, [query]);
  const categoryName = useMemo(() => query.get('category') || '', [query]);

  type SortOption = {
    label: string;
    field: ProductFiltersState['sortField'];
    dir: ProductFiltersState['sortDir'];
  };

  const sortOptions = useMemo<SortOption[]>(() => ([
    { label: 'Default', field: null, dir: null },
    { label: 'Price: Low to High', field: 'price', dir: 'asc' },
    { label: 'Price: High to Low', field: 'price', dir: 'desc' },
    { label: 'Rating: High to Low', field: 'avgRating', dir: 'desc' },
    { label: 'Views: High to Low', field: 'views', dir: 'desc' },
  ]), []);

  const buildSearchPayload = useCallback((): ProductFilterDto => ({
    name: searchTerm || undefined,
    subcategoryId: subcategoryId ?? undefined,
    lowerPriceBound: filters.lowerPriceBound ?? undefined,
    upperPriceBound: filters.upperPriceBound ?? undefined,
    characteristics: filters.characteristics ?? undefined,
  }), [searchTerm, subcategoryId, filters.lowerPriceBound, filters.upperPriceBound, filters.characteristics]);

  const buildSortParam = useCallback(() => (
    filters.sortField && filters.sortDir ? `${filters.sortField},${filters.sortDir}` : undefined
  ), [filters.sortField, filters.sortDir]);

  const currentSortLabel = useMemo(() => {
    const match = sortOptions.find((option) => option.field === filters.sortField && option.dir === filters.sortDir);
    return match?.label ?? 'Default';
  }, [filters.sortDir, filters.sortField, sortOptions]);

  const handleSortSelect = useCallback((option: SortOption) => {
    const changed = filters.sortField !== option.field || filters.sortDir !== option.dir;
    if (!changed) {
      setSortMenuOpen(false);
      return;
    }

    setPendingFilters((prev) => ({
      ...(prev ?? {
        lowerPriceBound: null,
        upperPriceBound: null,
        characteristics: null,
        sortField: null,
        sortDir: null,
      }),
      sortField: option.field,
      sortDir: option.dir,
    }));

    setFilters((prev) => ({
      ...prev,
      sortField: option.field,
      sortDir: option.dir,
    }));

    setApplyKey((k) => k + 1);
    setSortMenuOpen(false);
  }, [filters.sortDir, filters.sortField]);

  const categoryBreakdown = useMemo(() => {
    if (!products.length) return [] as {
      category: string;
      categoryId?: number;
      count: number;
      subcategories: { name: string; count: number; id?: number }[];
    }[];

    const fallbackCategory = 'Uncategorized';
    const fallbackSubcategory = 'Other';
    const categoryMap = new Map<string, { count: number; id?: number; subMap: Map<string, { count: number; name: string; id?: number }> }>();

    products.forEach((product) => {
      const category = product.categoryName?.trim() || fallbackCategory;
      const subcategory = product.subcategoryName?.trim() || fallbackSubcategory;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, id: product.categoryId ?? undefined, subMap: new Map() });
      }

      const entry = categoryMap.get(category)!;
      entry.count += 1;
      if (!entry.id && product.categoryId) {
        entry.id = product.categoryId;
      }

      const subKey = product.subcategoryId != null ? `id:${product.subcategoryId}` : `name:${subcategory}`;
      const existingSub = entry.subMap.get(subKey);
      if (existingSub) {
        existingSub.count += 1;
      } else {
        entry.subMap.set(subKey, {
          count: 1,
          name: subcategory,
          id: product.subcategoryId ?? undefined,
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, { count, id, subMap }]) => ({
        category,
        categoryId: id,
        count,
        subcategories: Array.from(subMap.values())
          .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => (b.count - a.count) || a.category.localeCompare(b.category));
  }, [products]);

  useEffect(() => {
    if (expandedCategory && !categoryBreakdown.some((entry) => entry.category === expandedCategory)) {
      setExpandedCategory(null);
    }
  }, [expandedCategory, categoryBreakdown]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!sortMenuRef.current) return;
      if (!sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortMenuOpen]);

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

  const activeCategoryId = useMemo(() => {
    if (!categoryName) return undefined;
    const match = categoryBreakdown.find((e) => e.category === categoryName);
    return match?.categoryId;
  }, [categoryBreakdown, categoryName]);

  // Load saved filters on first mount (persist across reloads)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('search.filters.v1');
      if (raw) {
        const saved = JSON.parse(raw) as ProductFiltersState;
        setFilters(saved);
        setPendingFilters(saved);
        setApplyKey(k => k + 1); // trigger initial fetch with saved filters
      }
    } catch (e) {
      console.warn('Failed to load saved filters', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist applied filters whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('search.filters.v1', JSON.stringify(filters));
    } catch (e) {
      console.warn('Failed to save filters', e);
    }
  }, [filters]);

  useEffect(() => {
    if (categoryName) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setLoadingMore(false);
      setProducts([]);
      setVisibleCount(PAGE_SIZE);
      setNextSearchPage(0);
      setHasMoreSearchPages(false);
      try {
        const payload = buildSearchPayload();
        const sort = buildSortParam();
        const results = await searchProductsWithFilter(payload, 0, PAGE_SIZE, controller.signal, sort);
        const content = results.content || [];
        const prepared = prepareProducts(content, filters);
        setProducts(prepared);
        setVisibleCount(Math.min(PAGE_SIZE, prepared.length));
        setHasMoreSearchPages(results?.last === false);
        if (typeof results?.totalElements === 'number') {
          setTotalResults(results.totalElements);
        } else {
          setTotalResults(prepared.length);
        }
        if (results && typeof results.number === 'number') {
          setNextSearchPage(results.number + 1);
        } else {
          setNextSearchPage(1);
        }
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
  }, [searchTerm, applyKey, subcategoryId, categoryName, buildSearchPayload, buildSortParam, filters]);

  useEffect(() => {
    if (!categoryName) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {

        const payload: ProductFilterDto = {
          name: undefined,
          categoryId: activeCategoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
          lowerPriceBound: filters.lowerPriceBound ?? undefined,
          upperPriceBound: filters.upperPriceBound ?? undefined,
          characteristics: filters.characteristics ?? undefined,
        };
        const sort = filters.sortField && filters.sortDir ? `${filters.sortField},${filters.sortDir}` : undefined;
        const results = await searchProductsWithFilter(payload, 0, 100, controller.signal, sort);
        setProducts(results.content || []);
        setVisibleCount(24);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        console.error(err);
        setError('Failed to fetch products for the selected category.');

      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };

  }, [categoryName, activeCategoryId, subcategoryId, applyKey, filters.lowerPriceBound, filters.upperPriceBound, filters.characteristics, filters.sortField, filters.sortDir]);


  const handleCategorySummaryClick = useCallback((categoryLabel: string) => {
    const params = new URLSearchParams(location.search);
    params.delete('subcategoryId');
    params.delete('subcategory');
    if (!categoryLabel || categoryLabel === 'Uncategorized') {
      params.delete('category');
    } else {
      params.set('category', categoryLabel);
    }
    navigate(`/search?${params.toString()}`);
    setShowFilters(false);
  }, [location.search, navigate]);

  const handleSubcategorySummaryClick = useCallback((subcategory: { name: string; id?: number }) => {
    const params = new URLSearchParams(location.search);
    params.delete('category');
    if (subcategory.id != null) {
      params.set('subcategoryId', String(subcategory.id));
      params.delete('subcategory');
    } else {
      params.delete('subcategoryId');
      params.set('subcategory', subcategory.name);
    }
    navigate(`/search?${params.toString()}`);
    setShowFilters(false);
  }, [location.search, navigate]);

  const loadMore = useCallback(async () => {
    if (categoryName) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length));
      return;
    }

    if (loading || loadingMore || !hasMoreSearchPages) {
      return;
    }

    const controller = new AbortController();
    try {
      setLoadingMore(true);
      const payload = buildSearchPayload();
      const sort = buildSortParam();
      const results = await searchProductsWithFilter(payload, nextSearchPage, PAGE_SIZE, controller.signal, sort);
      const content = results.content || [];
      setProducts((prev) => {
        const merged = prepareProducts([...prev, ...content], filters);
        const added = merged.length - prev.length;
        if (added > 0) {
          setVisibleCount((prevVisible) => prevVisible + added);
        }
        return merged;
      });
      setHasMoreSearchPages(results?.last === false);
      if (typeof results?.totalElements === 'number') {
        setTotalResults(results.totalElements);
      } else {
        setTotalResults((prev) => (prev != null ? Math.max(prev, products.length + content.length) : products.length + content.length));
      }
      if (results && typeof results.number === 'number') {
        setNextSearchPage(results.number + 1);
      } else {
        setNextSearchPage((prev) => prev + 1);
      }
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError('Failed to load more results.');
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [categoryName, loading, loadingMore, hasMoreSearchPages, buildSearchPayload, buildSortParam, nextSearchPage, filters, products.length]);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = categoryName ? visibleCount < products.length : hasMoreSearchPages;
  const totalDisplayCount = categoryName ? products.length : (typeof totalResults === 'number' ? totalResults : products.length);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#151515]"></div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] text-red-500">{error}</div>
  );
  if (!loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[#838383]">No products found.</div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-white mt-6 md:mt-10 px-5 md:px-12 gap-6 md:gap-10">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-64 bg-white`}>
        <div className="space-y-6">
          <div className="border border-[#E2E2E2] bg-white">
            <div className="px-8 pt-10 pb-8 space-y-8">
              <div className="flex items-center gap-5">
                <h2 className="text-2xl tracking-wide text-[#2C2C2C]">Categories</h2>
              </div>

              <div className="space-y-5">
                {categoryBreakdown.length ? (
                  categoryBreakdown.map((entry) => {
                    const isExpanded = expandedCategory === entry.category;
                    return (
                      <div
                        key={entry.category}
                        className="border-t border-[#E7E7E7] first:border-t-0 bg-white"
                      >
                        <div className="px-8 py-2.5">
                          <div className="flex items-start gap-3">
                            <span className="block h-[20px] w-[2px] bg-[#2C2C2C]" aria-hidden="true" />
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span
                                  role="link"
                                  tabIndex={0}
                                  onClick={() => handleCategorySummaryClick(entry.category)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleCategorySummaryClick(entry.category);
                                    }
                                  }}
                                  className="text-base font-medium text-[#3F3F3F] hover:underline cursor-pointer"
                                >
                                  {entry.category}
                                </span>
                                <span className="text-xs font-medium text-[#5F5F5F]">({entry.count})</span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedCategory((prev) => (prev === entry.category ? null : entry.category))}
                                  className="inline-flex h-6 w-6 items-center justify-center text-[#606060] hover:text-[#2C2C2C]"
                                  aria-label={isExpanded ? `Collapse ${entry.category}` : `Expand ${entry.category}`}
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                              <p className="text-xs text-[#7A7A7A] mt-1">{entry.count} item{entry.count === 1 ? '' : 's'}</p>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <div className="px-8 pb-5">
                            <div className="mt-2 space-y-1.5">
                              {entry.subcategories.map((sub) => (
                                <div
                                  key={`${entry.category}-${sub.name}`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleSubcategorySummaryClick(sub)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleSubcategorySummaryClick(sub);
                                    }
                                  }}
                                  className="flex w-full items-center gap-3 px-2 py-1.5 cursor-pointer transition-colors duration-150 hover:text-[#2C2C2C]"
                                >
                                  <span className="block h-[16px] w-[2px] bg-[#A2A2A2]" aria-hidden="true" />
                                  <span className="truncate text-sm text-[#4A4A4A]" title={sub.name}>{sub.name}</span>
                                  <span className="text-xs font-medium text-[#5F5F5F]">({sub.count})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#838383]">Filters will populate when products load.</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border border-[#e7e7e7] rounded-sm bg-white">
            <div className="lg:hidden flex justify-end mb-4">
              <button onClick={() => setShowFilters(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilters
              initial={filters}
              onChange={handleFiltersChange}
              searchName={searchTerm}
              subcategoryId={subcategoryId}
              categoryId={activeCategoryId}
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={applyFiltersNow}
                className="px-4 py-2 rounded-2xl bg-[#282828] text-white text-sm"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingFilters(emptyFilters);
                  setFilters(emptyFilters);
                  try { localStorage.removeItem('search.filters.v1'); } catch {}
                  setApplyKey((k)=>k+1);
                }}
                className="px-4 py-2 rounded-2xl border text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </aside>

        {/* Main Content */}
        <div className="flex-1 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#151515]">
              {categoryName ? `${categoryName} Products` : 'All Items'}
            </h1>
            {categoryName ? (
              <p className="text-sm text-[#838383] mt-1">Showing products in the "{categoryName}" category.</p>
            ) : searchTerm ? (
              <p className="text-sm text-[#838383] mt-1">Search results for: "{searchTerm}"</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setSortMenuOpen((open) => !open)}
                className="inline-flex items-center gap-3 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-medium text-[#555555] hover:text-[#2C2C2C] hover:border-[#BDBDBD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BDBDBD]"
              >
                <span className="uppercase text-xs tracking-wide text-[#8A8A8A]">Sort By</span>
                <span className="text-sm text-[#454545]">{currentSortLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${sortMenuOpen ? 'rotate-180 text-[#2C2C2C]' : 'text-[#8A8A8A]'}`} />
              </button>
              {sortMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white">
                  <ul className="py-2">
                    {sortOptions.map((option) => {
                      const isActive = option.field === filters.sortField && option.dir === filters.sortDir;
                      return (
                        <li key={`${option.label}-${option.field ?? 'none'}-${option.dir ?? 'none'}`}>
                          <button
                            type="button"
                            onClick={() => handleSortSelect(option)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors duration-150 ${isActive ? 'text-[#2C2C2C] font-medium' : 'text-[#4F4F4F]'} hover:bg-[#F4F4F4] hover:text-[#1F1F1F]`}
                          >
                            <span>{option.label}</span>
                            {isActive ? <span className="text-xs uppercase tracking-wider text-[#7C7C7C]">Active</span> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
            <button onClick={() => setShowFilters(true)} className="lg:hidden p-2 rounded-md border border-[#e7e7e7] text-[#4F4F4F] hover:text-[#1F1F1F]">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-[#585858] mb-12">
          Showing {displayedProducts.length} of {totalDisplayCount} item(s)
        </p>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {displayedProducts.map((product, index) => {
              const divider = (index + 1) % 8 === 0 && index !== displayedProducts.length - 1;
              return (
                <React.Fragment key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {(() => {
                      const primary = product.pictures?.find(p => p.pictureType === 'PRIMARY') || product.pictures?.[0];
                      const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : '/images/product/placeholder.jpg';
                      const formatCurrency = (value: number) => `$${Number(value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                      const effectivePrice = product.price ?? 0;
                      const baselinePrice = product.priceWithoutDiscount ?? effectivePrice;
                      const computedPercentage = product.discountPercentage ?? (
                        baselinePrice > 0 ? ((baselinePrice - effectivePrice) / baselinePrice) * 100 : 0
                      );
                      const showDiscount = baselinePrice > effectivePrice && computedPercentage > 0;
                      const price = formatCurrency(effectivePrice);
                      const oldPrice = showDiscount ? formatCurrency(baselinePrice) : undefined;
                      const discountPercent = showDiscount ? `-${Math.round(computedPercentage)}%` : undefined;
                      return (
                        <ProductCard
                          id={product.id}
                          slug={product.slug}
                          imageUrl={imgUrl}
                          title={product.name || ''}
                          price={price}
                          oldPrice={oldPrice}
                          discountPercent={discountPercent}
                          quantityInStock={product.quantityInStock}
                        />
                      );
                    })()}
                  </motion.div>
                  {divider ? (
                    <div className="col-span-full border-t border-[#e7e7e7] mt-4 mb-2" aria-hidden="true" />
                  ) : null}
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </motion.div>

        </div>
      </div>
      {hasMore && (
        <div className="mt-12 mb-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] transition-colors disabled:bg-[#989898] disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
};

export default SearchResults;