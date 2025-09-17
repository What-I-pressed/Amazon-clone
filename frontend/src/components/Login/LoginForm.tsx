  import React, { useState, useContext } from "react";
  import { login } from "../../services/authService";
  import { AuthContext } from "../../context/AuthContext";
  import { useNavigate, Link } from "react-router-dom";

  const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
        setError(err.response?.data?.message || "Login failed");
      }
    };

    return (
      <div className="min-h-screen w-full flex items-start justify-center bg-white pt-50">
        <div className="flex w-2/3 h-[70%] bg-white rounded-lg overflow-hidden transition-transform duration-1000 hover:scale-[1.01] border border-gray-300">
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
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Sign In</h1>
                <p className="text-gray-600 text-base">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-[60px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-gray-700 placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full h-[60px] px-5 border border-[#dedfe1] rounded-[60px] bg-white text-gray-700 placeholder-[#939393] focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-[60px] bg-[#42A275] text-white text-lg px-6 rounded-[60px] font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </button>
              </form>

              {/* Extra Links */}
              <div className="mt-8 flex justify-between text-sm text-gray-600">
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
