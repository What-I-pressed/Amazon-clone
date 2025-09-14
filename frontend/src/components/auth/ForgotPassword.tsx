import { useState } from 'react';
import { Eye, Search, ShoppingCart, User } from 'lucide-react';

export default function PasswordResetForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="text-white px-4 py-3" style={{ backgroundColor: '#434343' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <select className="absolute left-0 top-0 h-full px-3 text-white text-sm border-none rounded-l focus:outline-none" style={{ backgroundColor: '#7E7E7E' }}>
                <option>All</option>
              </select>
              <input
                type="text"
                placeholder="Nexora Search"
                className="w-full pl-16 pr-12 py-2 text-gray-700 placeholder-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ backgroundColor: '#A2A2A2' }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-400 rounded">
                <Search size={20} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-8">
            <div className="text-sm">
              <span>EN ▼</span>
            </div>
            <div className="text-sm">
              <span>Returns & Orders</span>
            </div>
            <div className="text-sm">
              <div>Hello, sign in</div>
              <div className="flex items-center">
                <span>Account ▼</span>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ShoppingCart size={20} />
              <span className="ml-1">Cart</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center h-screen absolute inset-0 top-0">
        <div className="w-full max-w-2xl">
          {/* Form Container */}
          <div className="bg-white border border-gray-300 rounded-lg p-16 shadow-sm">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-700 mb-16 font-afacad">
              Forgot Your Password
            </h1>

            {/* New Password Field */}
            <div className="mb-7">
              <label className="block text-gray-700 text-base font-medium mb-2.5">
                Write New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3.5 py-3.5 border border-gray-300 rounded-full text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label className="block text-gray-700 text-base font-medium mb-2.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3.5 py-3.5 border border-gray-300 rounded-full text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Eye 
                    size={20} 
                    className={`transition-all duration-300 ${showConfirmPassword ? 'text-green-600 scale-110' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              className="w-full text-white text-lg font-medium py-4 px-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:scale-105 active:scale-95 transform"
              style={{ backgroundColor: '#42A275' }}
            >
              Confirm
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}