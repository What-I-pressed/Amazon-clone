import { useEffect, useState } from "react";
import type { Product } from "../../types/product";
import type { Seller } from "../../types/seller";
import { fetchSellerProfile, fetchSellerProducts, updateSellerProfile, fetchSellerStats } from "../../api/seller";

const SellerEditProfile = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile form states
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [language, setLanguage] = useState("uk");
  const [timezone, setTimezone] = useState("Europe/Kiev");

  // Address states
  const [shippingAddress, setShippingAddress] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputBase =
    "w-full px-6 py-4 border placeholder-gray-500 focus:outline-none transition-colors";
  const inputNormal =
    inputBase +
    " bg-[#DFDFDF] border-[#DFDFDF] rounded-full hover:border-gray-400 focus:bg-white";
  const inputArea =
    "w-full px-6 py-4 border rounded-2xl placeholder-gray-500 focus:outline-none transition-colors resize-none bg-[#DFDFDF] border-[#DFDFDF] hover:border-gray-400 focus:bg-white";

  const buttonClass =
    "px-12 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, prods] = await Promise.all([
          fetchSellerProfile(),
          fetchSellerProducts().catch(() => [] as Product[]),
        ]);

        // Optionally fetch stats separately if not included in profile
        let stats = profile.stats;
        if (!stats) {
          try {
            stats = await fetchSellerStats();
          } catch {}
        }

        setSeller({ ...profile, stats });

        const nameParts = (profile.username || "").split(" ");
        setFirstName(nameParts[0] || "");
        setSurname(nameParts.slice(1).join(" ") || "");
        setEmail(profile.email || "");
        setDescription(profile.description || "");
        setAvatar(profile.avatar || "");
        setProducts(prods || []);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Не вдалося завантажити профіль продавця");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!seller) return;
    setSaving(true);
    try {
      const updated = await updateSellerProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        description,
        avatar,
      });
      setSeller((prev) => ({ ...(prev as Seller), ...updated }));
    } catch (e: any) {
      setError(e?.message || "Не вдалося оновити профіль продавця");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Налаштування збережено!");
    }, 1000);
  };

  const handleProductChange = (
    id: string,
    field: keyof Product,
    value: string | number
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveProducts = async () => {
    // TODO: implement save products API when available
    if (!seller) return;
    setSaving(true);
    try {
      setSeller({ ...seller });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    // TODO: implement address update API when available
    setSaving(true);
    try {
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Паролі не співпадають!");
      return;
    }
    // TODO: implement password change API when available
    setSaving(true);
    try {
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Завантаження профілю...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-4">Помилка: {error}</div>
    );

  if (!seller)
    return (
      <div className="text-gray-500 text-center mt-4">Профіль не знайдено</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Налаштування профілю
          </h1>
          <p className="text-gray-600">
            Керуйте своїм профілем продавця, налаштуваннями акаунту та товарами
            в одному місці.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Information */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Основна інформація
              </h2>

              {/* Avatar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Аватар
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-semibold">
                        {firstName.charAt(0).toUpperCase() || "S"}
                      </span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" className={inputNormal} />
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ім'я *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputNormal}
                    placeholder="Введіть ім'я"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Прізвище *
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={inputNormal}
                    placeholder="Введіть прізвище"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email адреса *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputNormal}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Номер телефону
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-4 py-4 border border-r-0 border-[#DFDFDF] rounded-l-full bg-[#DFDFDF]">
                      <span className="text-lg mr-2">🇺🇦</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-6 py-4 bg-[#DFDFDF] border border-[#DFDFDF] rounded-r-full placeholder-gray-500 focus:outline-none hover:border-gray-400 focus:bg-white transition-colors"
                      placeholder="+380 97 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис магазину
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputArea}
                  placeholder="Опишіть ваш магазин або бізнес..."
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Збереження..." : "Зберегти профіль"}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Зміна паролю
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новий пароль
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className={inputNormal}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Підтвердити пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className={inputNormal}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !newPassword || !confirmPassword}
                  className={buttonClass}
                >
                  {saving ? "Збереження..." : "Змінити пароль"}
                </button>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Адреса
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адреса доставки
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ваша адреса"
                  rows={4}
                  className={inputArea}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Область
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Область"
                    className={inputNormal}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Поштовий індекс
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Поштовий індекс"
                    className={inputNormal}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Збереження..." : "Зберегти адресу"}
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Налаштування акаунту
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    Сповіщення
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Email сповіщення
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        SMS сповіщення
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoReply}
                        onChange={(e) => setAutoReply(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Автовідповіді
                      </span>
                    </label>
                  </div>
                </div>

                {/* Language & Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Мова
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={inputNormal}
                    >
                      <option value="uk">Українська</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Часовий пояс
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className={inputNormal}
                    >
                      <option value="Europe/Kiev">Europe/Kiev</option>
                      <option value="Europe/Warsaw">Europe/Warsaw</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Збереження..." : "Зберегти налаштування"}
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Редагувати товари
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-[#DFDFDF] rounded-lg p-6 space-y-4"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) =>
                        handleProductChange(product.id, "name", e.target.value)
                      }
                      className={inputNormal}
                      placeholder="Назва товару"
                    />
                    <textarea
                      value={product.description}
                      onChange={(e) =>
                        handleProductChange(
                          product.id,
                          "description",
                          e.target.value
                        )
                      }
                      className={inputArea}
                      rows={3}
                      placeholder="Опис товару"
                    />
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(
                          product.id,
                          "price",
                          parseFloat(e.target.value)
                        )
                      }
                      className={inputNormal}
                      placeholder="Ціна"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveProducts}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Збереження..." : "Зберегти товари"}
                </button>
              </div>
            </div>

            {/* Account Info / Quick Actions / Danger Zone */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="border-b border-[#DFDFDF] pb-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Інформація про акаунт
                </h2>
                <p className="text-gray-600 mb-2">
                  ID: <span className="font-mono">{seller.id}</span>
                </p>
                <p className="text-gray-600 mb-2">Email: {seller.email}</p>
                <p className="text-gray-600 mb-2">Рейтинг: {seller.rating}/5</p>
                <p className="text-gray-600 mb-2">
                  Товарів: {products.length}
                </p>
                <p className="text-gray-600">
                  Замовлень: {seller.stats?.totalOrders ?? 0}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="border-b border-[#DFDFDF] pb-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Швидкі дії
                </h2>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => alert("Товар додано")}
                    className={buttonClass}
                  >
                    Додати товар
                  </button>
                  <button
                    onClick={() => alert("Звіт згенеровано")}
                    className={buttonClass}
                  >
                    Згенерувати звіт
                  </button>
                  <button
                    onClick={() => alert("Імпорт даних...")}
                    className={buttonClass}
                  >
                    Імпортувати дані
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pb-8">
                <h2 className="text-lg font-semibold text-red-600 mb-6">
                  Небезпечна зона
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => alert("Акаунт деактивовано")}
                    className="px-12 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
                  >
                    Деактивувати акаунт
                  </button>
                  <button
                    onClick={() => alert("Акаунт видалено")}
                    className="px-12 py-3 bg-red-700 text-white font-medium rounded-full hover:bg-red-800 transition-colors"
                  >
                    Видалити акаунт
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default SellerEditProfile;
