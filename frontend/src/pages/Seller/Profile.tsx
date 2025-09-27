import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSellerProfileBySlug, fetchSellerProductsBySlug, fetchSellerProfile } from "../../api/seller";
import { updateProduct, deleteProduct } from "../../api/products";
import { AuthContext } from "../../context/AuthContext";
import type { Seller } from "../../types/seller";
import type { Product } from "../../types/product";
import ProductCard from "../ProductCard";

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

const formatDateInput = (isoDate?: string | null) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function SellerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const authContext = useContext(AuthContext);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(createEmptyEditForm());
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [hasMore, setHasMore] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

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
        setSeller(sellerData);

        const productsPage = await fetchSellerProductsBySlug(slug, 0, itemsPerPage);
        setProducts(productsPage.content || []);
        setHasMore(productsPage.content.length === itemsPerPage);
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
  
    setLoadingMore(true);
    const nextSize = itemsPerPage + 12; // +12 к размеру выборки
  
    try {
      // всегда грузим с page=0, но с растущим size
      const productsPage = await fetchSellerProductsBySlug(slug, 0, nextSize);
  
      // заменяем весь список товара
      setProducts(productsPage.content || []);
  
      // проверяем, есть ли ещё
      setHasMore(productsPage.content.length < productsPage.totalElements);
  
      setItemsPerPage(nextSize); // сохраняем новое значение size
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      priceWithoutDiscount: product.priceWithoutDiscount ?? product.price,
      discountPercentage: calculateDiscountPercentage(
        product.priceWithoutDiscount ?? product.price,
        product.price
      ),
      discountLaunchDate: formatDateInput(product.discountLaunchDate),
      discountExpirationDate: formatDateInput(product.discountExpirationDate),
    });
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
        <div className="rounded-2xl border border-[#e0e0e0] p-8 flex items-center gap-8 mb-8">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#333]">{seller.username}</h1>
            {seller.description && (
              <p className="text-base text-[#666] mt-2">{seller.description}</p>
            )}
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

         {/* Products */}
        <main className="col-span-9">
          <div className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-semibold">All items</h2>
                <p className="text-[#4D4D4D]">found: {products.length}</p>
                <br />
                <div className="border-t border-[#e0e0e0] my-3"></div>
                <p className="text-[#a8a8a8]">All items below are created and listed by the same seller. Explore more from this author</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product) => (
              <div key={product.id} className="relative">
                {editingProduct?.id === product.id ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Product name"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => updateEditForm("description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Product description"
                      />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => updateEditForm("price", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                      />
                      <input
                        type="number"
                        value={editForm.priceWithoutDiscount}
                        onChange={(e) => updateEditForm("priceWithoutDiscount", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Price without discount"
                        step="0.01"
                        min="0"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col text-sm text-gray-600">
                          Discount start
                          <input
                            type="date"
                            value={editForm.discountLaunchDate}
                            onChange={(e) => updateEditForm("discountLaunchDate", e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex flex-col text-sm text-gray-600">
                          Discount end
                          <input
                            type="date"
                            value={editForm.discountExpirationDate}
                            onChange={(e) => updateEditForm("discountExpirationDate", e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Current discount: <span className="font-semibold text-gray-700">{editForm.discountPercentage.toFixed(2)}%</span>
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
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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
                className="px-6 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] transition-colors disabled:bg-gray-400"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
