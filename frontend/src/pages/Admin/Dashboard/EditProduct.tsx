import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditAdForm from "../../../components/EditAdForm";
import { fetchProductById, fetchProductBySlug } from "../../../api/products";
import type { Product } from "../../../types/product";

export default function AdminEditProductPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; slug?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      const { id, slug } = params;
      if (!id && !slug) {
        setError("Unable to determine product to edit.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let loadedProduct: Product | null = null;

        if (slug) {
          loadedProduct = await fetchProductBySlug(slug);
        } else if (id) {
          const numericId = Number(id);
          if (!Number.isNaN(numericId)) {
            loadedProduct = await fetchProductById(numericId);
          }
        }

        if (!loadedProduct) {
          setError("Product not found or access denied.");
        } else {
          setProduct(loadedProduct);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load product for editing.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params]);

  const handleSuccess = (updatedProduct: Product) => {
    setProduct(updatedProduct);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151515]">Edit Product (Admin)</h1>
          <p className="text-sm text-[#585858]">
            You are editing a product on behalf of its seller.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#dadada] px-4 py-2 text-sm text-[#585858] hover:bg-gray-100"
        >
          Back
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#e7e7e7] bg-gray-50 px-4 py-3 text-sm text-[#585858]">
          Loading product...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <EditAdForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
