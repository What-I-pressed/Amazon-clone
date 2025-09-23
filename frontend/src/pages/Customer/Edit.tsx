import { useEffect, useState } from "react";
import type { Customer } from "../../types/customer";
import { fetchCustomerProfile, updateCustomerProfile } from "../../api/customer";

const CustomerEditProfile = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile form states
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState("uk");

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
        const profile = await fetchCustomerProfile();
        
        setCustomer(profile);
        
        const nameParts = (profile.username || "").split(" ");
        setFirstName(nameParts[0] || "");
        setSurname(nameParts.slice(1).join(" ") || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setAvatar(profile.avatar || "");
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Не вдалося завантажити профіль покупця");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const updated = await updateCustomerProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        phone,
        avatar,
      });
      setCustomer(updated);
    } catch (e: any) {
      setError(e?.message || "Не вдалося оновити профіль покупця");
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

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      // TODO: implement address update API when available
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

  if (!customer)
    return (
      <div className="text-gray-500 text-center mt-4">Профіль не знайдено</div>
    );

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Налаштування профілю
          </h1>
          <p className="text-gray-600">
            Керуйте своїм профілем покупця та налаштуваннями акаунту.
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
                        {firstName.charAt(0).toUpperCase() || "C"}
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
                  </div>
                </div>

                {/* Language */}
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

            {/* Account Info / Danger Zone */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="border-b border-[#DFDFDF] pb-8 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Інформація про акаунт
                </h2>
                <p className="text-gray-600 mb-2">
                  ID: <span className="font-mono">{customer.id}</span>
                </p>
                <p className="text-gray-600 mb-2">Email: {customer.email}</p>
                <p className="text-gray-600 mb-2">
                  Телефон: {customer.phone || 'Не вказано'}
                </p>
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

export default CustomerEditProfile;
