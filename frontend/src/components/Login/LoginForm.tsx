// src/components/Auth/LoginForm.tsx
import React, { useState, useContext } from "react";
import { login } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("LoginForm must be used within AuthProvider");
  const { loginUser } = auth;

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(emailOrPhone, password);
      const token = res.data.token;
      await loginUser(token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl w-full max-w-4xl flex overflow-hidden border border-gray-200">
        {/* Left side with form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2">Login</h2>
          <p className="text-gray-600 mb-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Register here
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Your Email Or Phone
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="your@email.com"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Your Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-black transition"
            >
              Login
            </button>

            {/* Forgot password */}
            <div className="text-center mt-4">
              <Link
                to="/forgot-password"
                className="text-green-600 hover:underline text-sm"
              >
                Forgot Your Password?
              </Link>
            </div>
          </form>
        </div>

        {/* Right side with image */}
        <div className="hidden md:flex md:w-1/2">
          <img
            src="/images/auth-side.jpg"
            alt="Team"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

