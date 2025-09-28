import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditAdForm from "../../components/EditAdForm";
import { fetchProductById, fetchProductBySlug } from "../../api/products";
import type { Product } from "../../types/product";

export default function EditProductPage() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; slug?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      const { id, slug } = params;
      if (!id && !slug) {
        setError("Не вдалося визначити товар для редагування.");
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
          setError("Товар не знайдено або у вас немає доступу до нього.");
        } else {
          setProduct(loadedProduct);
        }
      } catch (err: any) {
        setError(err?.message || "Не вдалося завантажити товар для редагування.");
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#151515]">Редагування товару</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-full border border-[#dadada] text-sm text-[#585858] hover:bg-gray-100"
        >
          Назад
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#e7e7e7] bg-gray-50 px-4 py-3 text-sm text-[#585858]">
          Завантаження товару...
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
