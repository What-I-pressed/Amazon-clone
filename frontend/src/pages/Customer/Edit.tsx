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
  const [countryCode, setCountryCode] = useState("+380");
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
        const profile = await fetchCustomerProfile();
        
        setCustomer(profile);
        
        const nameParts = (profile.username || "").split(" ");
        setFirstName(nameParts[0] || "");
        setSurname(nameParts.slice(1).join(" ") || "");
        setEmail(profile.email || "");
        setCountryCode(profile.phone?.startsWith("+1") ? "+1" : "+380");
        setPhone(formatLocalNumber(profile.phone?.replace(/^\+\d+\s?/, "") || "", profile.phone?.startsWith("+1") ? "+1" : "+380"));
        setAvatar(profile.avatar || "");
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Failed to load customer profile");
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
        name: firstName.trim() || undefined,
        description: customer.description,
        phone,
      });
      setCustomer(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to update customer profile");
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
    setSaving(true);
    try {
      // TODO: implement address update API when available
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

  useEffect(() => {
    setPhone((prev) => formatLocalNumber(prev, countryCode));
  }, [countryCode]);

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

  if (!customer)
    return (
      <div className="text-[#838383] text-center mt-4">Profile not found</div>
    );

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#151515] mb-2">
            Profile Settings
          </h1>
          <p className="text-[#585858]">
            Manage your customer profile and account preferences in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Information */}
            <div className="border-b border-[#DFDFDF] pb-8 mb-8">
              <h2 className="text-lg font-semibold text-[#151515] mb-6">
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
                        {firstName.charAt(0).toUpperCase() || "C"}
                      </span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" className={inputBaseClass} />
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#454545] mb-2">
                    First Name*
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
                  </div>
                </div>

                {/* Language */}
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

            {/* Account Info / Danger Zone */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="border-b border-[#DFDFDF] pb-8 mb-8">
                <h2 className="text-lg font-semibold text-[#151515] mb-6">
                  Account Information
                </h2>
                <p className="text-[#585858] mb-2">Email: {customer.email}</p>
                <p className="text-[#585858] mb-2">
                  Phone: {customer.phone || "Not provided"}
                </p>
              </div>

              {/* Danger Zone */}
              <div className="pb-8">
                <div className="space-y-4">
                  <button
                    onClick={() => alert("Account deleted")}
                    className="px-6 py-2 text-red-500 rounded-full transition-colors duration-200 hover:text-red-600"
                  >
                    Delete Account
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
