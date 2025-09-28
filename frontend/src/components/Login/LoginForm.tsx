import React, { useState, useContext } from "react";
import { login } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

  const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const auth = useContext(AuthContext);
    if (!auth) throw new Error("LoginForm must be used within AuthProvider");
    const { loginUser } = auth;

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await login(email, password);
        const token = res.data.token;
        await loginUser(token);
        navigate("/");
      } catch (err: any) {
        const status = err.response?.status;
        const serverError = err.response?.data?.error || err.response?.data?.message;
        if (status === 403 && typeof serverError === "string" && serverError.toLowerCase().includes("not verified")) {
          // redirect to verification pending with email
          navigate(`/verify-pending?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(serverError || "Login failed");
      }
    };

    const handleGoogleLogin = () => {
      // Initiates Spring Security OAuth2 login for Google
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
      <div className="min-h-screen w-full flex items-start justify-center bg-white pt-24">
        <div className="flex w-2/3 h-[70%] bg-white rounded-lg overflow-hidden border border-[#dadada]">
          {/* Left Panel - Image */}
          <div className="w-1/2 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
              alt="Login illustration"
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          {/* Right Panel - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-12">
            <div className="w-full max-w-md animate-fadeIn">
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-4xl font-bold text-[#2a2a2a] mb-3">Sign In</h1>
                <p className="text-[#585858] text-base">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-[#42A275] hover:underline transition-colors duration-200"
                  >
                    Register here.
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
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-base font-medium text-[#454545] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-[60px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#454545] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full h-[60px] pr-14 pl-5 border border-[#dedfe1] rounded-[60px] bg-white text-[#454545] placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                <button
                  type="submit"
                  className="w-full h-[60px] bg-[#42A275] text-white text-lg px-6 rounded-[60px] font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-[#e7e7e7]" />
                <span className="px-4 text-[#838383] text-sm">or</span>
                <div className="flex-1 h-px bg-[#e7e7e7]" />
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-[54px] border border-[#dadada] rounded-[54px] flex items-center justify-center gap-3 hover:bg-gray-50 transition"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="text-[#454545] font-medium">Continue with Google</span>
              </button>

              {/* Extra Links */}
              <div className="mt-8 flex justify-between text-sm text-[#585858]">
                <Link
                  to="/forgot-password"
                  className="hover:text-green-600 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="form-checkbox text-green-600" />
                  <span>Remember me</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default LoginForm;
