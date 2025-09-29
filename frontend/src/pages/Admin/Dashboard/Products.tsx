import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  fetchProductsPage,
  deleteProduct,
  type ProductFilterPayload,
  type ProductPageResponse,
} from "../../../api/products";

const PAGE_SIZE = 12;

const AdminProductsDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("AdminProductsDashboard must be used within AuthProvider");
  }

  const [productsResponse, setProductsResponse] = useState<ProductPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ProductFilterPayload>({});
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProductsPage(page, PAGE_SIZE, filters);
      setProductsResponse(response);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
      setProductsResponse(null);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated || String(auth.user?.roleName ?? "").toUpperCase() !== "ADMIN") {
      return;
    }
    loadProducts();
  }, [auth.loading, auth.isAuthenticated, auth.user?.roleName, loadProducts]);

  const products = useMemo(() => productsResponse?.content ?? [], [productsResponse]);
  const totalPages = productsResponse?.totalPages ?? 0;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    const nextFilters: ProductFilterPayload = trimmed ? { ...filters, name: trimmed } : {};
    setFilters(nextFilters);
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#151515]">Admin Product Management</h1>
          <p className="text-[#585858]">Search, edit, or delete any seller's products.</p>
        </div>
        <form className="flex items-center gap-2" onSubmit={handleSearch}>
          <input
            type="text"
            className="rounded-lg border border-[#dadada] px-3 py-2 text-sm"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="rounded-lg border border-[#151515] px-4 py-2 text-sm text-[#151515] disabled:opacity-50"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#e7e7e7] bg-white">
        <div className="hidden bg-gray-50 text-sm font-medium text-[#454545] sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4 sm:px-6 sm:py-3">
          <span>Product</span>
          <span>Seller</span>
          <span className="text-right">Price</span>
          <span className="text-right">Stock</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-12 text-[#585858]">
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-[#151515]" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#585858]">No products found.</div>
        ) : (
          <ul className="divide-y divide-[#e7e7e7]">
            {products.map((product) => (
              <li
                key={product.id}
                className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-[#151515]">{product.name}</p>
                  <p className="text-xs text-[#838383]">ID: {product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-[#454545]">{product.sellerName ?? "Unknown seller"}</p>
                  {product.sellerId ? (
                    <p className="text-xs text-[#838383]">Seller ID: {product.sellerId}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm font-medium text-[#151515]">
                  ${product.price?.toFixed(2) ?? "0.00"}
                </div>
                <div className="text-right text-sm text-[#454545]">
                  {product.quantityInStock ?? 0}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#151515] px-3 py-1 text-xs font-medium text-[#151515] hover:bg-[#151515] hover:text-white"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-500 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            className="rounded-lg border border-[#dadada] px-4 py-2 text-sm text-[#454545] disabled:opacity-50"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={loading || page === 0}
          >
            Previous
          </button>
          <span className="text-sm text-[#585858]">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="rounded-lg border border-[#dadada] px-4 py-2 text-sm text-[#454545] disabled:opacity-50"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={loading || page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProductsDashboard;
