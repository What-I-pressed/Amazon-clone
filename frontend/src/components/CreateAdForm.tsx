import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import Button from "./ui/button/Button";
import {
  createProductForSeller,
  type ProductCreationPayload,
} from "../api/products";
import { fetchSellerProfile } from "../api/seller";
import { uploadProductPicture } from "../api/pictures";

type UploadMessage = {
  name: string;
  status: "success" | "error";
  message: string;
};

type SubcategoryOption = {
  id: number;
  name: string;
};

const inputBaseClass =
  "w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-full px-7 py-3.5 text-base text-gray-700 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-0 focus:border-[#DFDFDF] hover:bg-white focus:bg-white";

export default function CreateAdForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("1");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [messages, setMessages] = useState<UploadMessage[]>([]);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [createdProductSlug, setCreatedProductSlug] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, SubcategoryOption[]>>({});

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  const categoryOptions = useMemo(() => Object.keys(categoryMap).sort((a, b) => a.localeCompare(b)), [categoryMap]);
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
        console.error("[CreateAdForm] Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

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
    } else if (!subcategoryName || !subcategoriesForCategory.some((option) => option.name === subcategoryName)) {
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

      const seller = await fetchSellerProfile();
      if (!seller || typeof seller.id !== "number") {
        throw new Error(
          "Не вдалося визначити продавця. Увійдіть у свій акаунт продавця."
        );
      }

      const numericPrice = Number(price);
      const payload: ProductCreationPayload = {
        name,
        description: description || undefined,
        price: numericPrice,
        priceWithoutDiscount: numericPrice,
        quantityInStock: Number(quantityInStock),
        categoryName,
        subcategoryName: subcategoryName || undefined,
      };

      const product = await createProductForSeller(seller.id, payload);
      const productId = (product as any)?.id;
      const productSlug = (product as any)?.slug ?? null;
      setCreatedProductId(productId ?? null);
      setCreatedProductSlug(productSlug);

      if (productId && files.length > 0) {
        const uploadMessages: UploadMessage[] = [];

        for (const file of files) {
          try {
            await uploadProductPicture(productId, file);
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

      setSuccessMessage(`Товар «${product?.name ?? name}» успішно створений.`);

      setName("");
      setPrice("");
      setQuantityInStock("1");
      setCategoryName("");
      setSubcategoryName("");
      setDescription("");
      setFiles([]);
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "Помилка створення товару");
    } finally {
      setLoading(false);
    }
  };

  const viewProductUrl = useMemo(() => {
    if (createdProductSlug) {
      return `/product/${createdProductSlug}`;
    }
    if (createdProductId) {
      return `/product/${createdProductId}`;
    }
    return null;
  }, [createdProductId, createdProductSlug]);

  const handleViewProduct = useCallback(() => {
    if (viewProductUrl) {
      navigate(viewProductUrl);
    }
  }, [navigate, viewProductUrl]);

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
            <h2 className="text-xl font-semibold text-gray-900">Product photos</h2>
            <p className="text-base text-gray-500 mt-1">
              Upload product images. The first image will be used as the cover photo.
            </p>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-3xl border-2 border-dashed px-8 py-14 text-center transition-all ${
              isDragActive
                ? "border-gray-900 bg-white"
                : "border-[#DFDFDF] bg-[#F8F8F8]"
            }`}
          >
            <div className="mx-auto flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white border border-[#DFDFDF] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-gray-500"
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
                <p className="text-sm text-gray-700">
                  Drag & drop files here or choose manually
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP formats up to 10 MB each
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
                <h3 className="text-base font-semibold text-gray-700">
                  Selected files ({previews.length})
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
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
                        <p className="text-base font-medium text-gray-800 truncate max-w-[240px]">
                          {preview.name}
                        </p>
                        <p className="text-sm text-gray-500">{formatFileSize(preview.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-500 hover:text-gray-800"
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
              <h3 className="text-base font-semibold text-gray-700 mb-3">Upload status</h3>
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
            <h2 className="text-xl font-semibold text-gray-900">Product details</h2>
            <p className="text-base text-gray-500 mt-1">
              Provide the essential product information. Fields marked with * are required.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-gray-600">Product name*</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Wireless headphones"
                className={inputBaseClass}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-gray-600">Price*</span>
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-gray-600">Stock quantity*</span>
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
                <span className="text-sm text-gray-600">Category*</span>
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
                  {categoryOptions.length === 0 && <option value="">Loading categories...</option>}
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-gray-600">Subcategory</span>
              <select
                value={subcategoryName}
                onChange={(event) => setSubcategoryName(event.target.value)}
                className={inputBaseClass}
                disabled={(subcategoryOptions?.length ?? 0) === 0}
              >
                {subcategoryOptions.length === 0 && <option value="">No subcategories</option>}
                {subcategoryOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-gray-600">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell more about your product"
                className="w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-3xl px-7 py-5 text-base text-gray-700 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-0 focus:border-[#DFDFDF] hover:bg-white focus:bg-white min-h-[160px]"
              />
            </label>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create product"}
        </Button>

        {viewProductUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleViewProduct}
          >
            View product
          </Button>
        )}
      </div>
    </form>
  );
}
