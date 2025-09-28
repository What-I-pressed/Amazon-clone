import { useEffect, useState, useRef } from "react";
import type { User } from "../../types/user";
import { fetchUserProfile, updateUserProfile } from "../../api/user";
import { uploadUserAvatar } from "../../api/pictures";

const CustomerEditProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile form states
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Avatar upload ref
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const inputBaseClass =
    "w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-full px-7 py-3.5 text-base text-gray-700 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-0 focus:border-[#DFDFDF] hover:bg-white focus:bg-white";

  const buttonClass =
    "px-12 py-3 bg-[#282828] text-white font-medium rounded-full hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);

        const nameParts = (profile.username || "").split(" ");
        setFirstName(nameParts[0] || "");
        setSurname(nameParts.slice(1).join(" ") || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        
        // Handle both base64 and file path URLs
        if (profile.url) {
          if (profile.url.startsWith('data:')) {
            // Base64 image
            setAvatar(profile.url);
          } else {
            // File path from backend
            setAvatar(`http://localhost:8080/uploads/avatars/${profile.url}`);
          }
        } else {
          setAvatar("");
        }
        
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Не вдалося завантажити профіль користувача");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setSaving(true);
      
      // Upload avatar to backend
      const uploadedUrl = await uploadUserAvatar(user.id, file);
      const fullUrl = `http://localhost:8080/uploads/avatars/${uploadedUrl}`;
      setAvatar(fullUrl);
      
      // Update user profile with new avatar URL
      await updateUserProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        phone,
        url: uploadedUrl, // Store relative path in backend
      });
      
      setUser(prev => prev ? { ...prev, url: uploadedUrl } : null);
    } catch (err: any) {
      setError(err?.message || "Не вдалося завантажити аватар");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        phone,
        url: user.url, // Keep existing avatar URL
      });
      setUser((prev) => ({ ...(prev as User), ...updated }));
    } catch (e: any) {
      setError(e?.message || "Не вдалося оновити профіль користувача");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Заповніть обидва поля паролю");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }
    // TODO: Implement password change API call
    setError("Зміна паролю поки не реалізована");
  };

  if (loading) {
    return <div className="p-6 text-center">Завантаження...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Редагування профілю</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-8">
          <h2 className="text-xl font-semibold mb-6">Основна інформація</h2>

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
                    {firstName.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <input 
                  ref={avatarInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  className={inputBaseClass}
                  disabled={saving}
                />
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
                className={inputBaseClass}
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
                className={inputBaseClass}
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
                className={inputBaseClass}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефону
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputBaseClass}
                placeholder="+380 XX XXX XX XX"
              />
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

        {/* Password Section */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-8">
          <h2 className="text-xl font-semibold mb-6">Зміна паролю</h2>

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
                className={inputBaseClass}
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
                className={inputBaseClass}
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
      </div>
    </div>
  );
};

export default CustomerEditProfile;
