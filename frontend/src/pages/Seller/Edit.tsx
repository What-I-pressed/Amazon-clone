import React, { useEffect, useState } from "react";
import { fetchSellerProfile, updateSellerProfile } from "../../api/seller";
import type { Seller } from "../../types/seller";

const SellerEditProfile: React.FC = () => {
  const [formData, setFormData] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const seller = await fetchSellerProfile();
        setFormData(seller);
      } catch (err) {
        console.error("Не вдалося завантажити профіль", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim() || value.length < 3) {
          return "Назва магазину має бути не менше 3 символів";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Некоректний email";
        }
        break;
      case "description":
        if (value.length > 500) {
          return "Опис не може перевищувати 500 символів";
        }
        break;
    }
    return "";
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const errs: { [key: string]: string } = {};
    errs.name = validateField("name", formData.name || "");
    errs.email = validateField("email", formData.email || "");
    errs.description = validateField("description", formData.description || "");
    setErrors(
      Object.fromEntries(
        Object.entries(errs).filter(([_, v]) => v !== "")
      )
    );
    return Object.values(errs).every((v) => v === "");
  };

  const handleBlur = (field: keyof Seller) => {
    if (!formData) return;
    const error = validateField(field, formData[field] as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !validateForm()) return;

    try {
      setSaving(true);
      await updateSellerProfile(formData);
      setSuccessMessage("✅ Профіль оновлено успішно!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("❌ Помилка при оновленні профілю");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl w-full max-w-lg p-8 border border-gray-200 relative">
        <h1 className="text-2xl font-bold mb-6">Редагування профілю</h1>

        {successMessage && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Назва магазину */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Назва магазину
            </label>
            <input
              type="text"
              value={formData?.name || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              onBlur={() => handleBlur("name")}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-gray-800"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData?.email || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, email: e.target.value } : null
                )
              }
              onBlur={() => handleBlur("email")}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-gray-800"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-medium mb-1">Опис</label>
            <textarea
              value={formData?.description || ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              onBlur={() => handleBlur("description")}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-gray-800"
              }`}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !validateForm()}
              className={`px-6 py-2 rounded-lg transition ${
                saving || !validateForm()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-black"
              }`}
            >
              {saving ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerEditProfile;
