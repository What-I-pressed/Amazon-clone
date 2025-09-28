import React, { useState, useContext } from "react";
import { register, sendVerificationEmail } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [registerAsSeller, setRegisterAsSeller] = useState(false);

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("RegistrationForm must be used within AuthProvider");
  const { loginUser } = auth; // retained for future use if needed

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    try {
      await register({
        role: registerAsSeller ? "SELLER" : "CUSTOMER",
        username: formData.username || formData.email.split("@")[0],
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      // Immediately send verification email and redirect to verify page
      await sendVerificationEmail(formData.email);
      // Store creds for auto-login after verification (ephemeral)
      sessionStorage.setItem("verify_email", formData.email);
      sessionStorage.setItem("verify_password", formData.password);
      navigate(`/verify-pending?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data || err.message || "Registration failed");
    }
  };

  const handleGoogleSignup = () => {
    // Initiates Spring Security OAuth2 login for Google
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-white pt-24 pb-24">
      <div className="flex w-2/3 h-[70%] bg-white rounded-lg overflow-hidden border border-[#dadada]">
        {/* Left Panel - Image */}
        <div className="w-1/2 hidden md:block">
          <div
            className="w-full h-full bg-cover bg-center opacity-50"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')",
            }}
          />
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-12">
          <div className="w-full max-w-md animate-fadeIn">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-[#2a2a2a] mb-3">Create Account</h1>
              <p className="text-[#585858] text-base">
                Already have an account?{" "}
                <Link to="/login" className="text-[#42A275] hover:underline transition-colors duration-200">
                  Sign in here.
                </Link>
              </p>
            </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name and Email Row */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="block text-base font-medium text-[#454545] mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-[56px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-base font-medium text-[#454545] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[56px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-base font-medium text-[#454545] mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-[56px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                placeholder="Choose a username"
              />
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="block text-base font-medium text-[#454545] mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-[56px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                placeholder="e.g. +1234567890"
              />
            </div>

            {/* Password and Confirm Password Row */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="block text-base font-medium text-[#454545] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-[56px] pr-14 pl-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#838383] hover:text-[#454545]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-base font-medium text-[#454545] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-[56px] pr-14 pl-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#838383] hover:text-[#454545]"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 text-[#42A275] focus:ring-[#42A275] border-[#dadada] rounded"
              />
              <label htmlFor="terms" className="text-sm text-[#585858]">
                I have read and agreed to the{" "}
                <a href="#" className="text-[#42A275] hover:underline transition-colors duration-200">Terms of Service</a> and{" "}
                <a href="#" className="text-[#42A275] hover:underline transition-colors duration-200">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  className="flex-1 min-w-[160px] h-[60px] bg-[#42A275] text-white text-lg px-6 rounded-[60px] font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:ring-offset-2"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterAsSeller((prev) => !prev)}
                  className={`min-w-[200px] whitespace-nowrap h-[60px] px-6 rounded-[60px] border text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    registerAsSeller
                      ? "border-[#151515] bg-[#151515] text-white focus:ring-[#dadada]"
                      : "border-[#dadada] text-[#454545] hover:border-[#989898] focus:ring-[#dadada]"
                  }`}
                >
                  {registerAsSeller ? "Want to be a customer?" : "Want to be a seller?"}
                </button>
              </div>
              <p className="text-xs text-[#838383]">
                You will be registered as a <span className="font-semibold text-[#454545]">{registerAsSeller ? "seller" : "customer"}</span> account.
              </p>
            </div>
          </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-[#e7e7e7]" />
              <span className="px-4 text-[#838383] text-sm">or</span>
              <div className="flex-1 h-px bg-[#e7e7e7]" />
            </div>

            {/* Google Sign up/Login */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full h-[54px] border border-[#dadada] rounded-[54px] flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-[#454545] font-medium">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
