import { useEffect, useState, useRef, type ChangeEvent } from "react";
import type { Product } from "../../types/product";
import type { Seller } from "../../types/seller";
import { fetchSellerProfile, fetchSellerProducts, updateSellerProfile, fetchSellerStats } from "../../api/seller";
import { uploadSellerAvatar } from "../../api/pictures";

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
  const [countryCode, setCountryCode] = useState("+380");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [language, setLanguage] = useState("uk");
  const [timezone, setTimezone] = useState("Europe/Kiev");

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Avatar upload ref
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const inputBaseClass =
    "w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-full px-7 py-3.5 text-base text-[#454545] placeholder:text-[#989898] transition-colors focus:outline-none focus:ring-0 focus:border-[#CFCFCF] hover:bg-[#FCFCFC] focus:bg-white";
  
  const inputArea =
    "w-full bg-[#F8F8F8] border border-[#DFDFDF] rounded-3xl px-7 py-5 text-base text-[#454545] placeholder:text-[#989898] transition-colors focus:outline-none focus:ring-0 focus:border-[#CFCFCF] hover:bg-[#FCFCFC] focus:bg-white min-h-[160px] resize-none";

  const buttonClass =
    "px-12 py-3 bg-[#42A275] text-white font-semibold rounded-full hover:bg-[#369167] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  const formatLocalNumber = (value: string, code: string) => {
    const digits = value.replace(/\D/g, "");

    if (code === "+380") {
      const trimmed = digits.slice(0, 9);
      const parts = [
        trimmed.slice(0, 2),
        trimmed.slice(2, 5),
        trimmed.slice(5, 7),
        trimmed.slice(7, 9),
      ].filter(Boolean);
      return parts.join(" ");
    }

    // Default formatting (USA +1)
    const trimmed = digits.slice(0, 10);
    const parts = [
      trimmed.slice(0, 3),
      trimmed.slice(3, 6),
      trimmed.slice(6, 10),
    ].filter(Boolean);
    return parts.join(" ");
  };

  const handlePhoneInput = (value: string, code: string) => {
    setPhone(formatLocalNumber(value, code));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await fetchSellerProfile();

        // Load stats if not embedded in profile
        let stats = profile.stats;
        if (!stats) {
          try {
            stats = await fetchSellerStats();
          } catch (statsError) {
            console.warn("[SellerEditProfile] Failed to load seller stats", statsError);
          }
        }

        // Load seller products using seller ID
        let sellerProducts: Product[] = [];
        try {
          const productsResponse = await fetchSellerProducts(profile.id, 0, 100);
          sellerProducts = productsResponse.content ?? [];
        } catch (productsError) {
          console.warn("[SellerEditProfile] Failed to load seller products", productsError);
        }

        setSeller({ ...profile, stats });

        const nameParts = (profile.username || "").split(" ");
        setFirstName(nameParts[0] || "");
        setSurname(nameParts.slice(1).join(" ") || "");
        setEmail(profile.email || "");
        setDescription(profile.description || "");
        // Handle both base64 and file path URLs
        if (profile.url) {
          if (profile.url.startsWith("data:")) {
            // Base64 image
            setAvatar(profile.url);
          } else {
            // File path from backend
            setAvatar(`http://localhost:8080/uploads/avatars/${profile.url}`);
          }
        } else {
          setAvatar("");
        }
        setProducts(sellerProducts);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Failed to load seller profile");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setPhone((prev) => formatLocalNumber(prev, countryCode));
  }, [countryCode]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !seller) return;

    try {
      setSaving(true);
      
      // Upload avatar to backend
      const uploadedUrl = await uploadSellerAvatar(seller.id, file);
      const fullUrl = `http://localhost:8080/uploads/avatars/${uploadedUrl}`;
      setAvatar(fullUrl);
      
      // Update seller profile with new avatar URL
      await updateSellerProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        description,
        url: uploadedUrl, // Store relative path in backend
      });
      
      setSeller(prev => prev ? { ...prev, url: uploadedUrl } : null);
    } catch (err: any) {
      setError(err?.message || "Failed to upload avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!seller) return;
    setSaving(true);
    try {
      const updated = await updateSellerProfile({
        username: `${firstName} ${surname}`.trim(),
        email,
        description,
        url: seller.url, // Keep existing avatar URL
      });
      setSeller((prev) => ({ ...(prev as Seller), ...updated }));
    } catch (e: any) {
      setError(e?.message || "Failed to update seller profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved!");
    }, 1000);
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
      alert("Passwords do not match!");
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
      <div className="flex justify-center items-center h-64 text-[#585858]">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-4">Error: {error}</div>
    );

  if (!seller)
    return (
      <div className="text-[#838383] text-center mt-4">Profile not found</div>
    );

  const ratingValue =
    typeof seller.rating === "number"
      ? seller.rating
      : typeof seller.stats?.avgFeedback === "number"
      ? seller.stats.avgFeedback
      : null;
  const formattedRating = ratingValue !== null ? `${ratingValue.toFixed(1)}/5` : "Not rated yet";
  const totalOrders = seller.stats?.totalOrders ?? 0;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#151515] mb-2">
            Profile Settings
          </h1>
          <p className="text-[#585858]">
            Manage your seller profile, account preferences, and products in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Information */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-2xl font-semibold text-[#151515] mb-6">
                Basic Information
              </h2>

              {/* Avatar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#454545] mb-3">
                  Avatar
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-[#989898] rounded-full flex items-center justify-center overflow-hidden">
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
                  <label className="block text-sm font-semibold text-[#454545] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputBaseClass}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#454545] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={inputBaseClass}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#454545] mb-2">
                    Email Address *
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
                  <label className="block text-sm font-medium text-[#454545] mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-32 rounded-l-full px-4 py-4 bg-[#F8F8F8] border border-[#DFDFDF] border-r-0 text-[#454545] focus:outline-none focus:ring-0 focus:border-[#CFCFCF] hover:bg-[#FCFCFC] focus:bg-white transition-colors text-sm"
                      aria-label="Country code"
                    >
                      <option value="+380">🇺🇦 +380</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneInput(e.target.value, countryCode)}
                      className="flex-1 px-6 py-4 bg-[#F8F8F8] border border-[#DFDFDF] rounded-r-full placeholder-[#838383] focus:outline-none focus:ring-0 focus:border-[#CFCFCF] hover:bg-[#FCFCFC] focus:bg-white transition-colors tracking-wide"
                      placeholder={countryCode === "+380" ? "97 123 45 67" : "123 456 7890"}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#838383]">
                    Full number: {countryCode} {phone.replace(/\s/g, "")}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#454545] mb-2">
                  Store Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={inputArea}
                  placeholder="Describe your store or business..."
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-2xl font-semibold text-[#151515] mb-6">
                Change Password
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#454545] mb-2">
                    New Password
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
                  <label className="block text-sm font-medium text-[#454545] mb-2">
                    Confirm Password
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
                  {saving ? "Saving..." : "Change Password"}
                </button>
              </div>
            </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className={buttonClass}
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-xl font-semibold text-[#151515] mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-md font-medium text-[#2a2a2a] mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-[#454545]">
                        Email Notifications
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-[#454545]">
                        SMS Notifications
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoReply}
                        onChange={(e) => setAutoReply(e.target.checked)}
                        className="h-4 w-4 text-[#282828] focus:ring-[#282828] border-[#DFDFDF] rounded"
                      />
                      <span className="ml-3 text-sm text-[#454545]">
                        Auto Replies
                      </span>
                    </label>
                  </div>
                </div>

                {/* Language & Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#454545] mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={inputBaseClass}
                    >
                      <option value="uk">Ukrainian</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#454545] mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className={inputBaseClass}
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
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>     

            {/* Account Info / Quick Actions / Danger Zone */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="border-b border-[#DFDFDF] pb-8 mb-8">
                <h2 className="text-lg font-semibold text-[#151515] mb-6">
                  Account Information
                </h2>
                <p className="text-[#585858] mb-2">Email: {seller.email}</p>
                <p className="text-[#585858] mb-2">Rating: {formattedRating}</p>
                <p className="text-[#585858] mb-2">
                  Products: {products.length}
                </p>
                <p className="text-[#585858]">
                  Orders: {totalOrders}
                </p>
              </div>

              {/* Danger Zone */}
              <div className="pb-8">
                <div className="space-y-4">
                  <button
                    onClick={() => alert("Account deleted")}
                    className="px-6 py-2 text-red-500 rounded-full hover: transition-colors duration-200 hover:text-red-600"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SellerEditProfile;
