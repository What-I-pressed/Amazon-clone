import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FixedSignupForm() {
  const [formData, setFormData] = useState({
    fullName: 'Sayyad Lev',
    email: 'sayyadlev@gmail.com',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (agreeToTerms) {
      alert('Account created successfully!');
      console.log('Form submitted:', formData);
    }
  };

  const headerStyle = {
    backgroundColor: '#434343'
  };

  const buttonStyle = agreeToTerms ? {
    backgroundColor: '#42A275'
  } : {};

  const handleButtonHover = (isHover) => {
    if (agreeToTerms) {
      return isHover ? '#369863' : '#42A275';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <div className="text-white px-6 py-3" style={headerStyle}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded-full"></div>
            </div>
            <span className="font-semibold text-lg">Nexora</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <select className="absolute left-0 top-0 bg-gray-600 border-r border-gray-500 rounded-l px-3 py-2 text-sm">
                <option>All</option>
              </select>
              <input 
                type="text" 
                placeholder="Nexora Search"
                className="w-full pl-16 pr-12 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 p-1 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <span>EN</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div>Returns & Orders</div>
            <div className="flex flex-col text-sm">
              <span>Hello, sign in</span>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="font-semibold">Cart</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center h-screen p-8">
        <div className="bg-white rounded-lg border-2 border-dashed border-blue-400 max-w-7xl w-full shadow-lg overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Left Panel - Image */}
            <div className="w-1/2 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden">
              <div className="relative z-10 text-center px-8">
                <div className="flex justify-center space-x-3 mb-8">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm max-w-sm mx-auto">
                  <div className="w-32 h-20 bg-white/40 rounded mb-4 mx-auto"></div>
                  <div className="text-white/90 text-lg font-medium mb-2">Professional Team</div>
                  <div className="text-white/70 text-sm">Building success together</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 to-purple-100/20"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-1/2 px-20 py-16 flex flex-col justify-center">
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Sign Up</h1>
                <p className="text-gray-600 text-base">
                  Already have an Account, 
                  <span className="text-blue-600 underline cursor-pointer hover:text-blue-700 ml-1">
                    Login
                  </span>
                </p>
              </div>

              <div className="space-y-7">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="******"
                        className="w-full px-5 py-3.5 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="******"
                        className="w-full px-5 py-3.5 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 pt-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-400 focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-gray-600 text-sm leading-5">
                    I have read and agreed to the Terms of Service and Privacy Policy
                  </label>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={!agreeToTerms}
                    style={buttonStyle}
                    onMouseEnter={(e) => {
                      if (agreeToTerms) {
                        e.target.style.backgroundColor = '#369863';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (agreeToTerms) {
                        e.target.style.backgroundColor = '#42A275';
                      }
                    }}
                    className={`w-full py-4 px-8 rounded-full font-semibold text-white text-base transition-all duration-200 ${
                      agreeToTerms 
                        ? 'focus:ring-4 focus:ring-green-200 cursor-pointer transform hover:scale-[1.01]' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}