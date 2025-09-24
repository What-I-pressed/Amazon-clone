import { useState } from 'react';

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
                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
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
                  {showNewPassword ? (
                    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
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
                  {showConfirmPassword ? (
                    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300 text-green-600 scale-110">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
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