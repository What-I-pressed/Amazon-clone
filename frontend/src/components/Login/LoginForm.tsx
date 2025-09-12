// src/components/Auth/LoginForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-xl w-full max-w-4xl flex overflow-hidden border border-gray-200">
        {/* Left side with form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2">Login</h2>
          <p className="text-gray-600 mb-6">
            Do not have an account?{" "}
            <Link to="/signup" className="text-green-600 hover:underline">
              Create a new one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Your Email Or Phone
              </label>
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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
