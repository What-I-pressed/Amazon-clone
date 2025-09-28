import { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchSellerProfileBySlug, fetchSellerProductsBySlug, fetchSellerProfile, fetchSellerStatsBySlug } from "../../api/seller";
import { updateProduct, deleteProduct } from "../../api/products";
import { AuthContext } from "../../context/AuthContext";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import ProductCard from "../ProductCard";
import { ChevronDown, SlidersHorizontal, X, Star } from "lucide-react";

const createEmptyEditForm = () => ({
  name: "",
  description: "",
  price: 0,
  priceWithoutDiscount: 0,
  discountPercentage: 0,
  discountLaunchDate: "",
  discountExpirationDate: "",
});

type ProductEditFormState = ReturnType<typeof createEmptyEditForm>;

const calculateDiscountPercentage = (priceWithoutDiscount: number, price: number) => {
  if (!priceWithoutDiscount || priceWithoutDiscount <= 0) return 0;
  if (price >= priceWithoutDiscount) return 0;
  const raw = ((priceWithoutDiscount - price) / priceWithoutDiscount) * 100;
  return Math.round(raw * 100) / 100;
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

type SortField = 'price' | 'avgRating' | 'views' | null;
type SortDir = 'asc' | 'desc' | null;

const sortProducts = (items: Product[], sortField: SortField, sortDir: SortDir) => {
  if (!sortField || !sortDir) return items;
  const direction = sortDir === 'desc' ? -1 : 1;

  const getComparableValue = (product: Product) => {
    switch (sortField) {
      case 'price': {
        const primary = typeof product.price === 'number' ? product.price : Number(product.price);
        const fallback = typeof product.priceWithoutDiscount === 'number'
          ? product.priceWithoutDiscount
          : Number(product.priceWithoutDiscount);
        if (Number.isFinite(primary)) return Number(primary);
        if (Number.isFinite(fallback)) return Number(fallback);
        return 0;
      }
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

export default function SellerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const authContext = useContext(AuthContext);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(createEmptyEditForm());
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [hasMore, setHasMore] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>(undefined);
  const [activeSubcategory, setActiveSubcategory] = useState<{ name: string; id?: number } | null>(null);
  const [priceMinInput, setPriceMinInput] = useState<string>("");
  const [priceMaxInput, setPriceMaxInput] = useState<string>("");
  const [lowerPriceBound, setLowerPriceBound] = useState<number | null>(null);
  const [upperPriceBound, setUpperPriceBound] = useState<number | null>(null);

  const updateEditForm = <K extends keyof ProductEditFormState>(key: K, value: ProductEditFormState[K]) => {
    setEditForm(prev => {
      const next = { ...prev, [key]: value } as ProductEditFormState;
      if (key === "price" || key === "priceWithoutDiscount") {
        next.discountPercentage = calculateDiscountPercentage(next.priceWithoutDiscount, next.price);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        const sellerData = await fetchSellerProfileBySlug(slug);
        let sellerWithStats = sellerData;
        if (!sellerData.stats) {
          try {
            const publicStats = await fetchSellerStatsBySlug(slug);
            sellerWithStats = { ...sellerData, stats: publicStats };
          } catch (statsErr) {
            console.warn("Failed to load public seller stats", statsErr);
          }
        }
        setSeller(sellerWithStats);

        const productsPage = await fetchSellerProductsBySlug(slug, 0, itemsPerPage);
        setProducts(productsPage.content || []);
        setHasMore(productsPage.content.length < productsPage.totalElements);
        setTotalResults(typeof productsPage.totalElements === 'number' ? productsPage.totalElements : (productsPage.content?.length ?? 0));
        // Check if current user is the owner of this profile
        if (authContext?.user) {
          try {
            const currentUserProfile = await fetchSellerProfile();
            setIsOwner(currentUserProfile.id === sellerData.id);
          } catch (err) {
            // User might not be a seller, that's fine
            setIsOwner(false);
          }
        }
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, authContext?.user]);

  const handleLoadMore = async () => {
    if (!slug || loadingMore) return;
  
    const nextSize = itemsPerPage + 12;
  
    try {
      const productsPage = await fetchSellerProductsBySlug(slug, 0, nextSize);

      setProducts(productsPage.content || []);
      setHasMore((productsPage.content?.length ?? 0) < (productsPage.totalElements ?? 0));
      setItemsPerPage(nextSize);
      setTotalResults(typeof productsPage.totalElements === 'number' ? productsPage.totalElements : (productsPage.content?.length ?? 0));
    } catch (err) {
      console.error("Failed to load more products:", err);
    }
  };
  
  const handleEditProduct = (product: Product) => {
    if (product.slug) {
      navigate(`/seller/products/slug/${product.slug}/edit`);
    } else if (product.id) {
      navigate(`/seller/products/${product.id}/edit`);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        priceWithoutDiscount: editForm.priceWithoutDiscount || editForm.price,
        discountLaunchDate: editForm.discountLaunchDate ? new Date(editForm.discountLaunchDate).toISOString() : undefined,
        discountExpirationDate: editForm.discountExpirationDate ? new Date(editForm.discountExpirationDate).toISOString() : undefined,
        quantityInStock: editingProduct.quantityInStock ?? 0,
        categoryName: editingProduct.categoryName ?? "General",
        subcategoryName: editingProduct.subcategoryName ?? undefined,
        characteristicTypeName: editingProduct.characteristicType ?? undefined,
      };

      if (!payload.priceWithoutDiscount || payload.priceWithoutDiscount <= 0) {
        payload.priceWithoutDiscount = payload.price;
      }

      const updatedProduct = await updateProduct(Number(editingProduct.id), payload);

      setProducts(prev => prev.map(p => {
        if (p.id !== editingProduct.id) return p;

        const effectivePriceWithoutDiscount = updatedProduct.priceWithoutDiscount ?? payload.priceWithoutDiscount ?? updatedProduct.price;
        const recalculatedDiscount = calculateDiscountPercentage(effectivePriceWithoutDiscount, updatedProduct.price);
        const recalculatedHasDiscount = updatedProduct.hasDiscount ?? effectivePriceWithoutDiscount > updatedProduct.price;

        return {
          ...p,
          ...updatedProduct,
          priceWithoutDiscount: effectivePriceWithoutDiscount,
          discountLaunchDate: updatedProduct.discountLaunchDate ?? payload.discountLaunchDate ?? null,
          discountExpirationDate: updatedProduct.discountExpirationDate ?? payload.discountExpirationDate ?? null,
          discountPercentage: recalculatedDiscount,
          hasDiscount: recalculatedHasDiscount,
        } as Product;
      }));
      setEditingProduct(null);
      setEditForm(createEmptyEditForm());
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to update product. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm(createEmptyEditForm());
  };

  const sortOptions = useMemo(() => ([
    { label: 'Default', field: null as SortField, dir: null as SortDir },
    { label: 'Price: Low to High', field: 'price' as SortField, dir: 'asc' as SortDir },
    { label: 'Price: High to Low', field: 'price' as SortField, dir: 'desc' as SortDir },
    { label: 'Rating: High to Low', field: 'avgRating' as SortField, dir: 'desc' as SortDir },
    { label: 'Views: High to Low', field: 'views' as SortField, dir: 'desc' as SortDir },
  ]), []);

  const currentSortLabel = useMemo(() => {
    const match = sortOptions.find(option => option.field === sortField && option.dir === sortDir);
    return match?.label ?? 'Default';
  }, [sortDir, sortField, sortOptions]);

  const handleSortSelect = useCallback((option: { label: string; field: SortField; dir: SortDir }) => {
    setSortField(option.field);
    setSortDir(option.dir);
    setSortMenuOpen(false);
  }, []);

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

  const sortedProducts = useMemo(() => sortProducts(products, sortField, sortDir), [products, sortField, sortDir]);

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

  const filteredProducts = useMemo(() => {
    let result = sortedProducts;
    if (activeCategory) {
      result = result.filter((product) => {
        const category = product.categoryName?.trim() || 'Uncategorized';
        if (activeCategoryId != null) {
          return product.categoryId === activeCategoryId;
        }
        return category.toLowerCase() === activeCategory.toLowerCase();
      });
    }
    if (activeSubcategory) {
      result = result.filter((product) => {
        if (activeSubcategory.id != null) {
          return product.subcategoryId === activeSubcategory.id;
        }
        const subName = product.subcategoryName?.trim() || 'Other';
        return subName.toLowerCase() === activeSubcategory.name.toLowerCase();
      });
    }
    if (lowerPriceBound != null || upperPriceBound != null) {
      result = result.filter((product) => {
        const price = Number.isFinite(product.price)
          ? Number(product.price)
          : (Number.isFinite(product.priceWithoutDiscount) ? Number(product.priceWithoutDiscount) : null);
        if (price == null) return false;
        if (lowerPriceBound != null && price < lowerPriceBound) return false;
        if (upperPriceBound != null && price > upperPriceBound) return false;
        return true;
      });
    }
    return result;
  }, [sortedProducts, activeCategory, activeCategoryId, activeSubcategory, lowerPriceBound, upperPriceBound]);

  const displayedProducts = filteredProducts.slice(0, itemsPerPage);
  const totalDisplayCount = totalResults != null ? totalResults : filteredProducts.length;
  const visibleCount = displayedProducts.length;
  const summaryText = totalDisplayCount > 0
    ? `Showing 1–${Math.min(itemsPerPage, filteredProducts.length)} of ${totalDisplayCount} item(s)`
    : 'No items found';

  const handleCategorySelect = useCallback((category: { category: string; categoryId?: number }) => {
    setActiveCategory(category.category);
    setActiveCategoryId(category.categoryId);
    setActiveSubcategory(null);
    setShowFilters(false);
  }, []);

  const handleSubcategorySelect = useCallback((category: { category: string; categoryId?: number }, sub: { name: string; id?: number }) => {
    setActiveCategory(category.category);
    setActiveCategoryId(category.categoryId);
    setActiveSubcategory({ name: sub.name, id: sub.id });
    setShowFilters(false);
  }, []);

  const handleApplyPriceFilter = useCallback(() => {
    const parsedMin = priceMinInput !== "" ? Number.parseFloat(priceMinInput) : null;
    const parsedMax = priceMaxInput !== "" ? Number.parseFloat(priceMaxInput) : null;

    setLowerPriceBound(Number.isFinite(parsedMin as number) ? parsedMin : null);
    setUpperPriceBound(Number.isFinite(parsedMax as number) ? parsedMax : null);
    setShowFilters(false);
  }, [priceMinInput, priceMaxInput]);

  const handleClearFilters = useCallback(() => {
    setActiveCategory(null);
    setActiveCategoryId(undefined);
    setActiveSubcategory(null);
    setLowerPriceBound(null);
    setUpperPriceBound(null);
    setPriceMinInput("");
    setPriceMaxInput("");
  }, []);

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

  const completedOrdersDisplay = seller.stats?.completedOrders != null
    ? seller.stats.completedOrders.toLocaleString()
    : "—";

  const averageRating = seller.stats && typeof seller.stats.avgFeedback === "number"
    ? seller.stats.avgFeedback
    : (typeof seller.rating === "number" ? seller.rating : null);
  const reviewsCount = seller.stats && typeof seller.stats.reviewsCount === "number"
    ? seller.stats.reviewsCount
    : null;

  return (
    <div className="min-h-screen bg-white">
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
        <div className="rounded-2xl border border-[#e0e0e0] p-8 flex flex-col gap-6 md:flex-row md:items-center md:gap-8 mb-8">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#333]">{seller.username}</h1>
              {seller.description && (
                <p className="text-base text-[#666] mt-2">{seller.description}</p>
              )}
              {averageRating !== null ? (
                <div className="mt-3 flex items-center gap-3 text-sm text-[#4D4D4D]">
                  <div className="flex items-center gap-1">
                    <Star
                      className={averageRating > 0 ? "w-5 h-5 text-[#F5A524] fill-[#F5A524]" : "w-5 h-5 text-[#dadada]"}
                    />
                    <span className="font-semibold text-[#333]">{averageRating.toFixed(1)}</span>
                  </div>
                  {reviewsCount !== null ? (
                    <span className="text-xs text-[#777]">
                      {reviewsCount.toLocaleString()} review{reviewsCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-xs uppercase tracking-wide text-[#9B9B9B]">Completed Orders</span>
              <span className="text-2xl font-semibold text-[#333]">{completedOrdersDisplay}</span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-4">
              <Link
                to="/seller/edit"
                className="px-6 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-72 bg-white`}>
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
                                      onClick={() => handleCategorySelect(entry)}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault();
                                          handleCategorySelect(entry);
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
                                      onClick={() => handleSubcategorySelect(entry, sub)}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault();
                                          handleSubcategorySelect(entry, sub);
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
                      <p className="text-xs text-[#838383]">Categories will populate once products load.</p>
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
                <div className="space-y-3 text-sm text-[#4F4F4F]">
                  <p className="text-xl text-[#2C2C2C] mb-3">Price Range</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={priceMinInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setPriceMinInput(value);
                        }
                      }}
                      placeholder="Min"
                      className="w-24 border rounded-xl px-2 py-1 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={priceMaxInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setPriceMaxInput(value);
                        }
                      }}
                      placeholder="Max"
                      className="w-24 border rounded-xl px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleApplyPriceFilter}
                      className="px-4 py-2 rounded-2xl bg-[#282828] text-white text-sm"
                    >
                      Apply Price
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="px-4 py-2 rounded-2xl border text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="p-6 mb-6 bg-white rounded-3xl">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-semibold">All items</h2>
                  <p className="text-[#4D4D4D] text-sm">{summaryText}</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto" ref={sortMenuRef}>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSortMenuOpen(open => !open)}
                      className="inline-flex items-center gap-3 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm font-medium text-[#555555] hover:text-[#2C2C2C] hover:border-[#BDBDBD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BDBDBD]"
                    >
                      <span className="uppercase text-xs tracking-wide text-[#8A8A8A]">Sort By</span>
                      <span className="text-sm text-[#454545]">{currentSortLabel}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${sortMenuOpen ? 'rotate-180 text-[#2C2C2C]' : 'text-[#8A8A8A]'}`} />
                    </button>
                    {sortMenuOpen ? (
                      <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-xl">
                        <ul className="py-2">
                          {sortOptions.map(option => {
                            const isActive = option.field === sortField && option.dir === sortDir;
                            return (
                              <li key={`${option.label}-${option.field ?? 'default'}-${option.dir ?? 'default'}`}>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative">
                  {editingProduct?.id === product.id ? (
                    <div className="border border-[#dadada] rounded-lg p-4 bg-white">
                      <div className="mb-4">
                        <img
                          src={
                            product.pictures && product.pictures.length > 0
                              ? `http://localhost:8080/${product.pictures[0].url}`
                              : "/images/product/placeholder.jpg"
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => updateEditForm("name", e.target.value)}
                          className="w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Product name"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => updateEditForm("description", e.target.value)}
                          className="w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          placeholder="Product description"
                        />
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => updateEditForm("price", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Price"
                          step="0.01"
                          min="0"
                        />
                        <input
                          type="number"
                          value={editForm.priceWithoutDiscount}
                          onChange={(e) => updateEditForm("priceWithoutDiscount", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Price without discount"
                          step="0.01"
                          min="0"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="flex flex-col text-sm text-[#585858]">
                            Discount start
                            <input
                              type="date"
                              value={editForm.discountLaunchDate}
                              onChange={(e) => updateEditForm("discountLaunchDate", e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </label>
                          <label className="flex flex-col text-sm text-[#585858]">
                            Discount end
                            <input
                              type="date"
                              value={editForm.discountExpirationDate}
                              onChange={(e) => updateEditForm("discountExpirationDate", e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-[#dadada] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-[#838383]">
                          Current discount: <span className="font-semibold text-[#454545]">{editForm.discountPercentage.toFixed(2)}%</span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProduct}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-[#585858] text-white rounded-md hover:bg-[#454545] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link to={`/product/${product.slug}`}>
                        {(() => {
                          const price = formatCurrency(product.price);
                          const baselinePrice = product.priceWithoutDiscount ?? product.price;
                          const percentValue = product.discountPercentage ?? calculateDiscountPercentage(baselinePrice, product.price);
                          const showDiscount = baselinePrice > product.price && percentValue > 0;
                          const oldPrice = showDiscount ? formatCurrency(baselinePrice) : undefined;
                          const discountBadge = showDiscount ? `-${Math.round(percentValue)}%` : undefined;

                          return (
                            <ProductCard
                              id={product.id}
                              imageUrl={
                                product.pictures && product.pictures.length > 0
                                  ? `http://localhost:8080/${product.pictures[0].url}`
                                  : "/images/product/placeholder.jpg"
                              }
                              title={product.name}
                              price={price}
                              oldPrice={oldPrice}
                              discountPercent={discountBadge}
                              quantityInStock={product.quantityInStock}
                            />
                          );
                        })()}
                      </Link>
                      {isOwner && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditProduct(product);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-3xl hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteProduct(product.id);
                            }}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-3xl hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] transition-colors disabled:bg-[#989898]"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
