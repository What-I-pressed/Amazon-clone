import { useState } from 'react';

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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Email verification states
  const [emailVerificationStep, setEmailVerificationStep] = useState<'form' | 'verification' | 'verified'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = async () => {
    if (!validateForm()) return;
    
    setIsCodeSending(true);
    
    // Simulate API call to send verification code
    setTimeout(() => {
      const code = generateVerificationCode();
      setSentCode(code);
      console.log('Verification code sent:', code); // In real app, this would be sent via email
      alert(`Verification code sent to ${formData.email}. For demo purposes, the code is: ${code}`);
      setEmailVerificationStep('verification');
      setIsCodeSending(false);
      startResendTimer();
    }, 1000);
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyCode = () => {
    if (!verificationCode.trim()) {
      setErrors({ verification: 'Please enter the verification code' });
      return;
    }
    
    if (verificationCode !== sentCode) {
      setErrors({ verification: 'Invalid verification code' });
      return;
    }
    
    setErrors({});
    setEmailVerificationStep('verified');
    
    // Create account after successful verification
    setTimeout(() => {
      alert('Email verified successfully! Account created.');
      console.log('Account created:', formData);
    }, 500);
  };

  const resendCode = () => {
    if (resendTimer > 0) return;
    
    const code = generateVerificationCode();
    setSentCode(code);
    console.log('New verification code:', code);
    alert(`New verification code sent: ${code}`);
    startResendTimer();
    setVerificationCode('');
    setErrors({});
  };

  const goBackToForm = () => {
    setEmailVerificationStep('form');
    setVerificationCode('');
    setSentCode('');
    setErrors({});
  };

  const isFormValid = agreeToTerms && 
    formData.fullName.trim() && 
    formData.email.trim() && 
    formData.password && 
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation */}
      <div className="bg-gray-700 text-white px-6 py-3">
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
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 p-1 rounded hover:bg-gray-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1 hover:text-green-400 cursor-pointer transition-colors">
              <span>EN</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="hover:text-green-400 cursor-pointer transition-colors">Returns & Orders</div>
            <div className="flex flex-col text-sm hover:text-green-400 cursor-pointer transition-colors">
              <span>Hello, sign in</span>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="font-semibold hover:text-green-400 cursor-pointer transition-colors">Cart</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-white rounded-lg border-2 border-dashed border-blue-400 max-w-7xl w-full shadow-lg overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Left Panel - Image */}
            <div className="w-1/2 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden">
              <div className="relative z-10 text-center px-8">
                <div className="flex justify-center space-x-3 mb-8">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm max-w-sm mx-auto">
                  <div className="w-32 h-20 bg-white/40 rounded mb-4 mx-auto"></div>
                  <div className="text-white/90 text-lg font-medium mb-2">
                    {emailVerificationStep === 'verification' ? 'Verify Your Email' : 
                     emailVerificationStep === 'verified' ? 'Email Verified!' : 'Professional Team'}
                  </div>
                  <div className="text-white/70 text-sm">
                    {emailVerificationStep === 'verification' ? 'Check your inbox for the code' : 
                     emailVerificationStep === 'verified' ? 'Welcome aboard!' : 'Building success together'}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 to-purple-100/20"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-1/2 px-20 py-16 flex flex-col justify-center">
              {emailVerificationStep === 'form' && (
                <>
                  <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Sign Up</h1>
                    <p className="text-gray-600 text-base">
                      Already have an Account, 
                      <span className="text-blue-600 underline cursor-pointer hover:text-blue-700 ml-1 transition-colors">
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
                          className={`w-full px-5 py-3.5 border rounded-full focus:outline-none focus:ring-2 text-gray-700 text-sm transition-all ${
                            errors.fullName 
                              ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                              : 'border-gray-300 focus:ring-green-400 focus:border-transparent'
                          }`}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
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
                          className={`w-full px-5 py-3.5 border rounded-full focus:outline-none focus:ring-2 text-gray-700 text-sm transition-all ${
                            errors.email 
                              ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                              : 'border-gray-300 focus:ring-green-400 focus:border-transparent'
                          }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                            className={`w-full px-5 py-3.5 pr-12 border rounded-full focus:outline-none focus:ring-2 text-gray-700 text-sm transition-all ${
                              errors.password 
                                ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                : 'border-gray-300 focus:ring-green-400 focus:border-transparent'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                            className={`w-full px-5 py-3.5 pr-12 border rounded-full focus:outline-none focus:ring-2 text-gray-700 text-sm transition-all ${
                              errors.confirmPassword 
                                ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                                : 'border-gray-300 focus:ring-green-400 focus:border-transparent'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
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
                      <label htmlFor="terms" className="text-gray-600 text-sm leading-5 cursor-pointer">
                        I have read and agreed to the Terms of Service and Privacy Policy
                      </label>
                    </div>
                    {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}

                    <div className="pt-6">
                      <button
                        onClick={sendVerificationCode}
                        disabled={!isFormValid || isCodeSending}
                        className={`w-full py-4 px-8 rounded-full font-semibold text-white text-base transition-all duration-200 ${
                          isFormValid && !isCodeSending
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]' 
                            : 'bg-gray-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {isCodeSending ? 'Sending Code...' : 'Send Verification Code'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {emailVerificationStep === 'verification' && (
                <>
                  <div className="mb-10">
                    <button
                      onClick={goBackToForm}
                      className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to form
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Verify Your Email</h1>
                    <p className="text-gray-600 text-base">
                      We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div className="space-y-7">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-3">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value);
                          if (errors.verification) {
                            setErrors({});
                          }
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className={`w-full px-5 py-3.5 border rounded-full focus:outline-none focus:ring-2 text-gray-700 text-sm transition-all text-center text-lg tracking-wider ${
                          errors.verification 
                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                            : 'border-gray-300 focus:ring-green-400 focus:border-transparent'
                        }`}
                      />
                      {errors.verification && <p className="text-red-500 text-xs mt-1">{errors.verification}</p>}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-600 text-sm mb-3">
                        Didn't receive the code?
                      </p>
                      <button
                        onClick={resendCode}
                        disabled={resendTimer > 0}
                        className={`text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors ${
                          resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer underline'
                        }`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={verifyCode}
                        disabled={!verificationCode.trim()}
                        className={`w-full py-4 px-8 rounded-full font-semibold text-white text-base transition-all duration-200 ${
                          verificationCode.trim()
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]' 
                            : 'bg-gray-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Verify & Create Account
                      </button>
                    </div>
                  </div>
                </>
              )}

              {emailVerificationStep === 'verified' && (
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Account Created!</h1>
                    <p className="text-gray-600 text-base">
                      Your email has been verified and your account is now active.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 focus:ring-4 focus:ring-green-200 transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}