import React, { useState } from "react";
import { useNavigate } from "react-router";
import Button from "./ui/button/Button";
import { createProductForSeller, type ProductCreationPayload } from "../api/products";
import { fetchSellerProfile } from "../api/seller";

export default function CreateAdForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("1");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!name || !price || !priceWithoutDiscount || !quantityInStock || !categoryName) {
        throw new Error("Заповніть обов'язкові поля: Назва, Ціна, Ціна без знижки, Кількість, Категорія");
      }

      const seller = await fetchSellerProfile();
      if (!seller || typeof seller.id !== "number") {
        throw new Error("Не вдалося визначити продавця. Увійдіть у свій акаунт продавця.");
      }

      const payload: ProductCreationPayload = {
        name,
        description: description || undefined,
        price: Number(price),
        priceWithoutDiscount: Number(priceWithoutDiscount),
        quantityInStock: Number(quantityInStock),
        categoryName,
        subcategoryName: subcategoryName || undefined,
      };

      const product = await createProductForSeller(seller.id, payload);
      // Redirect to pictures upload page for this product
      if (product && (product as any).id) {
        navigate(`/seller/products/${(product as any).id}/pictures`);
      } else {
        // fallback: stay here but inform user
        alert(`Товар створено: ${product?.name || name}. Не вдалося визначити ID для завантаження фото.`);
      }

      // reset form
      setName("");
      setPrice("");
      setPriceWithoutDiscount("");
      setQuantityInStock("1");
      setCategoryName("");
      setSubcategoryName("");
      setDescription("");
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "Помилка створення товару");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 bg-white rounded shadow">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Назва товару*"
        className="w-full p-2 border rounded"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ціна*"
          type="number"
          min="0"
          step="0.01"
          className="w-full p-2 border rounded"
        />

        <input
          value={priceWithoutDiscount}
          onChange={(e) => setPriceWithoutDiscount(e.target.value)}
          placeholder="Ціна без знижки*"
          type="number"
          min="0"
          step="0.01"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={quantityInStock}
          onChange={(e) => setQuantityInStock(e.target.value)}
          placeholder="Кількість на складі*"
          type="number"
          min="0"
          className="w-full p-2 border rounded"
        />

        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Категорія*"
          className="w-full p-2 border rounded"
        />
      </div>

      <input
        value={subcategoryName}
        onChange={(e) => setSubcategoryName(e.target.value)}
        placeholder="Підкатегорія"
        className="w-full p-2 border rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Опис"
        className="w-full p-2 border rounded"
        rows={4}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Створення..." : "Опублікувати"}
      </Button>
    </form>
  );
}
