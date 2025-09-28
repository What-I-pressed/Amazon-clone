import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "./ui/button/Button";
import { updateProduct } from "../api/products";
import { uploadProductPicture } from "../api/pictures";
import type { Product } from "../types/product";

type UploadMessage = {
  name: string;
  status: "success" | "error";
  message: string;
};

type SubcategoryOption = {
  id: number;
  name: string;
};

type EditAdFormProps = {
  product: Product | null;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
};

const inputBaseClass =
  "w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-full px-7 py-3.5 text-base text-[#454545] placeholder:text-[#989898] transition-colors focus:outline-none focus:ring-0 focus:border-[#DFDFDF] hover:bg-white focus:bg-white";

export default function EditAdForm({ product, onSuccess, onCancel }: EditAdFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("0");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [discountLaunchDate, setDiscountLaunchDate] = useState("");
  const [discountExpirationDate, setDiscountExpirationDate] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [messages, setMessages] = useState<UploadMessage[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [categoryMap, setCategoryMap] = useState<Record<string, SubcategoryOption[]>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [characteristics, setCharacteristics] = useState<
    { characteristic: string; value: string }[]
  >([]);
  const [newCharName, setNewCharName] = useState<string>("");
  const [newCharValue, setNewCharValue] = useState<string>("");

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  const categoryOptions = useMemo(
    () => Object.keys(categoryMap).sort((a, b) => a.localeCompare(b)),
    [categoryMap]
  );

  const subcategoryOptions = useMemo(() => {
    if (!categoryName) return [] as SubcategoryOption[];
    return categoryMap[categoryName] ?? [];
  }, [categoryMap, categoryName]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/characteristics/categories/");
        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }
        const data = await response.json();
        setCategoryMap(data ?? {});
      } catch (err) {
        console.error("[EditAdForm] Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!product) return;

    setName(product.name ?? "");
    setDescription(product.description ?? "");
    setPrice(product.price != null ? String(product.price) : "");
    setPriceWithoutDiscount(
      product.priceWithoutDiscount != null
        ? String(product.priceWithoutDiscount)
        : product.price != null
        ? String(product.price)
        : ""
    );
    setQuantityInStock(
      product.quantityInStock != null ? String(product.quantityInStock) : "0"
    );
    setCategoryName(product.categoryName ?? "");
    setSubcategoryName(product.subcategoryName ?? "");
    setDiscountLaunchDate(
      product.discountLaunchDate ? product.discountLaunchDate.split("T")[0] : ""
    );
    setDiscountExpirationDate(
      product.discountExpirationDate
        ? product.discountExpirationDate.split("T")[0]
        : ""
    );
    setCharacteristics(product.characteristics ?? []);
    setFiles([]);
    setMessages([]);
    setSuccessMessage(null);
    setError(null);
  }, [product]);

  useEffect(() => {
    if (!categoryName) {
      const firstCategory = categoryOptions[0];
      if (firstCategory) {
        setCategoryName(firstCategory);
        const firstSubcategory = categoryMap[firstCategory]?.[0]?.name ?? "";
        setSubcategoryName(firstSubcategory);
      }
      return;
    }

    const subcategoriesForCategory = categoryMap[categoryName] ?? [];
    if (subcategoriesForCategory.length === 0) {
      setSubcategoryName("");
    } else if (
      !subcategoryName ||
      !subcategoriesForCategory.some((option) => option.name === subcategoryName)
    ) {
      setSubcategoryName(subcategoriesForCategory[0].name);
    }
  }, [categoryOptions, categoryMap, categoryName, subcategoryName]);

  const handleFiles = useCallback((incoming: FileList | File[]) => {
    const candidates = Array.from(incoming).filter((file) =>
      file.type.startsWith("image/")
    );
    if (candidates.length === 0) {
      return;
    }

    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const next = candidates.filter(
        (file) => !existing.has(`${file.name}-${file.size}`)
      );
      if (next.length === 0) {
        return prev;
      }
      return [...prev, ...next];
    });
  }, []);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.target.files) {
        handleFiles(event.target.files);
        event.target.value = "";
      }
    },
    [handleFiles]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleFiles(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product) return;

    setError(null);
    setSuccessMessage(null);
    setMessages([]);

    if (!name || !price || !quantityInStock || !categoryName) {
      setError(
        "Заповніть обов'язкові поля: Назва, Ціна, Кількість, Категорія"
      );
      return;
    }

    try {
      setLoading(true);

      const numericPrice = Number(price);
      const numericOriginalPrice = Number(priceWithoutDiscount) || numericPrice;
      const payload = {
        name,
        description: description || undefined,
        price: numericPrice,
        priceWithoutDiscount: numericOriginalPrice,
        quantityInStock: Number(quantityInStock) || 0,
        categoryName,
        subcategoryName: subcategoryName || undefined,
        discountLaunchDate: discountLaunchDate
          ? new Date(discountLaunchDate).toISOString()
          : undefined,
        discountExpirationDate: discountExpirationDate
          ? new Date(discountExpirationDate).toISOString()
          : undefined,
        characteristics: characteristics
          .map((c) => ({
            characteristic: c.characteristic.trim(),
            value: c.value.trim(),
          }))
          .filter((c) => c.characteristic.length > 0 && c.value.length > 0),
      };

      const updatedProduct = await updateProduct(Number(product.id), payload);

      if (product.id && files.length > 0) {
        const uploadMessages: UploadMessage[] = [];

        for (const file of files) {
          try {
            await uploadProductPicture(product.id, file);
            uploadMessages.push({
              name: file.name,
              status: "success",
              message: "Файл завантажено",
            });
          } catch (err: any) {
            uploadMessages.push({
              name: file.name,
              status: "error",
              message:
                err?.response?.data || err?.message || "Не вдалося завантажити файл",
            });
          }
        }

        setMessages(uploadMessages);
      }

      setSuccessMessage(`Товар «${updatedProduct.name ?? name}» оновлено.`);
      setFiles([]);

      if (onSuccess) {
        onSuccess(updatedProduct);
      }
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "Помилка оновлення товару");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-700">
        Оберіть товар для редагування.
      </div>
    );
  }

  const hasDiscount = useMemo(() => {
    const original = Number(priceWithoutDiscount);
    const current = Number(price);
    if (!original || original <= 0) return false;
    return current < original;
  }, [price, priceWithoutDiscount]);

  const discountPercent = useMemo(() => {
    const original = Number(priceWithoutDiscount);
    const current = Number(price);
    if (!original || original <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  }, [price, priceWithoutDiscount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="space-y-8">
        <section className="space-y-6 rounded-3xl border border-[#E4E4E7] bg-white p-8">
          <div>
            <h2 className="text-xl font-semibold text-[#151515]">Product photos</h2>
            <p className="text-base text-[#838383] mt-1">
              Завантажте нові фото продукту. Поточні фото залишаться без змін.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {product.pictures?.map((picture) => (
              <div
                key={picture.id}
                className="rounded-2xl border border-[#DFDFDF] bg-[#F8F8F8] overflow-hidden"
              >
                <img
                  src={`http://localhost:8080/${picture.url}`}
                  alt={picture.name}
                  className="w-full h-48 object-cover"
                />
                <div className="px-5 py-3">
                  <p className="text-sm text-[#585858] truncate">{picture.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-3xl border-2 border-dashed px-8 py-14 text-center transition-all ${
              isDragActive
                ? "border-[#151515] bg-white"
                : "border-[#DFDFDF] bg-[#F8F8F8]"
            }`}
          >
            <div className="mx-auto flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#DFDFDF] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-[#838383]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#454545]">
                  Перетягніть файли сюди або оберіть вручну
                </p>
                <p className="text-xs text-[#838383]">
                  JPG, PNG, WEBP до 10 МБ кожен
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose files
              </Button>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                multiple
                onChange={onFileChange}
              />
            </div>
          </div>

          {previews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#454545]">
                  Нові файли ({previews.length})
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium text-[#838383] hover:text-[#454545]"
                  onClick={() => setFiles([])}
                >
                  Clear list
                </button>
              </div>

              <div className="space-y-4">
                {previews.map((preview, index) => (
                  <div
                    key={`${preview.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl bg-[#F8F8F8] border border-[#DFDFDF] px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#E2E2E2] bg-white">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#2a2a2a] truncate max-w-[240px]">
                          {preview.name}
                        </p>
                        <p className="text-sm text-[#838383]">
                          {formatFileSize(preview.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-[#838383] hover:text-[#2a2a2a]"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="rounded-2xl border border-[#E4E4E7] bg-gray-50 px-4 py-3">
              <h3 className="text-base font-semibold text-[#454545] mb-3">
                Статус завантаження
              </h3>
              <ul className="space-y-1 text-base">
                {messages.map((message, index) => (
                  <li
                    key={`${message.name}-${index}`}
                    className={
                      message.status === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {message.name}: {message.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-6 rounded-3xl border border-[#E4E4E7] bg-white p-8">
          <div>
            <h2 className="text-xl font-semibold text-[#151515]">Product details</h2>
            <p className="text-base text-[#838383] mt-1">
              Оновіть ключову інформацію товару. Поля з * є обов'язковими.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-[#585858]">Product name*</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Wireless headphones"
                className={inputBaseClass}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Price*</span>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputBaseClass}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Original price</span>
                <input
                  value={priceWithoutDiscount}
                  onChange={(event) => setPriceWithoutDiscount(event.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputBaseClass}
                />
              </label>
            </div>

            {hasDiscount && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Знижка {discountPercent}% буде показана на сторінці товару.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Stock quantity*</span>
                <input
                  value={quantityInStock}
                  onChange={(event) => setQuantityInStock(event.target.value)}
                  placeholder="1"
                  type="number"
                  min="0"
                  className={inputBaseClass}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Category*</span>
                <select
                  value={categoryName}
                  onChange={(event) => {
                    const newCategory = event.target.value;
                    setCategoryName(newCategory);
                    const firstSub = categoryMap[newCategory]?.[0]?.name ?? "";
                    setSubcategoryName(firstSub);
                  }}
                  className={inputBaseClass}
                  disabled={categoryOptions.length === 0}
                >
                  {categoryOptions.length === 0 && (
                    <option value="">Loading categories...</option>
                  )}
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-[#585858]">Subcategory</span>
              <select
                value={subcategoryName}
                onChange={(event) => setSubcategoryName(event.target.value)}
                className={inputBaseClass}
                disabled={(subcategoryOptions?.length ?? 0) === 0}
              >
                {subcategoryOptions.length === 0 && (
                  <option value="">No subcategories</option>
                )}
                {subcategoryOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Discount start</span>
                <input
                  value={discountLaunchDate}
                  onChange={(event) => setDiscountLaunchDate(event.target.value)}
                  type="date"
                  className={inputBaseClass}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-[#585858]">Discount end</span>
                <input
                  value={discountExpirationDate}
                  onChange={(event) =>
                    setDiscountExpirationDate(event.target.value)
                  }
                  type="date"
                  className={inputBaseClass}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-[#585858]">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell more about your product"
                className="w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-3xl px-7 py-5 text-base text-[#454545] placeholder:text-[#989898] transition-colors focus:outline-none focus:ring-0 focus:border-[#DFDFDF] hover:bg-white focus:bg-white min-h-[160px]"
              />
            </label>
          </div>
        </section>

        {/* Characteristics section */}
        <section className="space-y-6 rounded-3xl border border-[#E4E4E7] bg-white p-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Characteristics</h2>
            <p className="text-base text-gray-500 mt-1">
              Додайте власні характеристики товару (наприклад: Color, Material, Size).
            </p>
          </div>

          {/* Existing characteristics list */}
          {characteristics.length > 0 && (
            <ul className="space-y-2">
              {characteristics.map((c, idx) => (
                <li
                  key={`${c.characteristic}-${idx}`}
                  className="flex items-center gap-3 justify-between rounded-2xl bg-[#F8F8F8] border border-[#DFDFDF] px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{c.characteristic}</span>: {c.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-gray-500 hover:text-red-600"
                    onClick={() =>
                      setCharacteristics((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add new characteristic */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-2">Name</label>
              <input
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                placeholder="e.g., Color"
                className={inputBaseClass}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-600 mb-2">Value</label>
              <input
                value={newCharValue}
                onChange={(e) => setNewCharValue(e.target.value)}
                placeholder="e.g., Red"
                className={inputBaseClass}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const name = newCharName.trim();
                  const value = newCharValue.trim();
                  if (!name || !value) return;
                  setCharacteristics((prev) => {
                    // Avoid exact duplicates
                    if (prev.some((c) => c.characteristic === name && c.value === value)) {
                      return prev;
                    }
                    return [...prev, { characteristic: name, value }];
                  });
                  setNewCharName("");
                  setNewCharValue("");
                }}
              >
                Add characteristic
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
