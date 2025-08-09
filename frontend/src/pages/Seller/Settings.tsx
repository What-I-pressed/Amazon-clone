import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { fetchSellerProfile, updateSellerProfile } from "../../api/seller";
import type { Seller } from "../../types/seller";

const SellerSettings: React.FC = () => {
  const { id: sellerId } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  
  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [language, setLanguage] = useState("uk");
  const [timezone, setTimezone] = useState("Europe/Kiev");

  useEffect(() => {
    if (!sellerId) {
      setError("Ідентифікатор продавця не вказано");
      setLoading(false);
      return;
    }

    async function loadSeller() {
      try {
        setLoading(true);
        const data = await fetchSellerProfile(sellerId);
        setSeller(data);
        
        // Populate form fields
        setName(data.name || "");
        setEmail(data.email || "");
        setDescription(data.description || "");
        setAvatar(data.avatar || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    }

    loadSeller();
  }, [sellerId]);

  const handleSaveProfile = async () => {
    if (!sellerId) {
      setError("Ідентифікатор продавця відсутній");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const updatedData = {
        name,
        email,
        description,
        avatar,
      };

      const updated = await updateSellerProfile(sellerId, updatedData);
      setSeller(updated);
      
      // Show success message
      alert("Профіль успішно оновлено!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка оновлення профілю");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Here you would typically save settings to backend
      // For now, we'll just show a success message
      alert("Налаштування збережено!");
    } catch (e) {
      setError("Помилка збереження налаштувань");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Помилка завантаження
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Продавець не знайдено
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Профіль продавця не існує або був видалений
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Налаштування
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Управління профілем та налаштуваннями
              </p>
            </div>
            <Link
              to={`/seller/${sellerId}/dashboard`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              ← Назад до дашборду
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Інформація про профіль
              </h2>
              
              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Аватар
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {name.charAt(0).toUpperCase() || "S"}
                      </span>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG або GIF. Максимум 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ім'я продавця *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Введіть ім'я продавця"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Опис
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    placeholder="Опишіть ваш магазин або бізнес..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Збереження..." : "Зберегти профіль"}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Налаштування акаунту
              </h2>
              
              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Сповіщення
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Email сповіщення
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Отримувати сповіщення про замовлення на email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          SMS сповіщення
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Отримувати сповіщення про замовлення на телефон
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsNotifications}
                          onChange={(e) => setSmsNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Автоматичні відповіді
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Автоматично відповідати на відгуки клієнтів
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoReply}
                          onChange={(e) => setAutoReply(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Language and Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Мова
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="uk">Українська</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Часовий пояс
                    </label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Europe/Kiev">Київ (UTC+2)</option>
                      <option value="Europe/London">Лондон (UTC+0)</option>
                      <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                    </select>
                  </div>
                </div>

                {/* Save Settings Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-3 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Збереження..." : "Зберегти налаштування"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Info & Actions */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Інформація про акаунт
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID продавця:</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {sellerId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Рейтинг:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.rating}/5 ⭐
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Товарів:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.stats?.productsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Замовлень:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {seller.stats?.ordersCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Швидкі дії
              </h2>
              <div className="space-y-3">
                <Link
                  to={`/seller/${sellerId}/products/create`}
                  className="block w-full px-4 py-3 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors text-center"
                >
                  + Додати товар
                </Link>
                <Link
                  to={`/seller/${sellerId}/reviews`}
                  className="block w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Переглянути відгуки
                </Link>
                <Link
                  to={`/seller/${sellerId}/analytics`}
                  className="block w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Аналітика
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4">
                Небезпечна зона
              </h2>
              <div className="space-y-3">
                <button className="block w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                  Видалити акаунт
                </button>
                <button className="block w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                  Деактивувати магазин
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
