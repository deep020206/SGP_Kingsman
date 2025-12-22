import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from './AuthContext';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import OTPModal from './OTPModal';

const Login = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate(); 

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/send-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setPendingUserId(data.userId);
        setShowOTPModal(true);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP login error:', error);
      setErrorMsg('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPVerificationSuccess = (data) => {
    // Store user data and login
    if (data.token && data.user) {
      login(data); // Pass the entire data object with token and user
      
      // Close modal
      setShowOTPModal(false);
      if (onClose) onClose();
      
      // Navigate based on role - use same logic as password login
      const role = data.user.role.toLowerCase();
      let redirectPath = '/user-dashboard';
      
      if (role === 'admin' || role === 'vendor') {
        redirectPath = '/dashboard';
        console.log('🧭 OTP Login: Redirecting to admin/vendor dashboard:', redirectPath);
      } else {
        redirectPath = '/user-dashboard';
        console.log('🧭 OTP Login: Redirecting to user dashboard:', redirectPath);
      }
      
      // Navigate to appropriate dashboard
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      console.log('🔄 Attempting login with:', { email, password: '***' });
      const res = await api.post('/auth/login', { email, password });
      console.log('✅ Login response full data:', JSON.stringify(res.data));
      
      if (!res.data?.token || !res.data?.user) {
        console.error('❌ Missing token or user in response:', res.data);
        setErrorMsg('Invalid login response. Please try again.');
        return;
      }

      const userRole = res.data.user.role;
      console.log('👤 User role from response:', userRole);
      
      if (!userRole || !['admin', 'customer'].includes(userRole.toLowerCase())) {
        console.error('❌ Invalid user role:', userRole);
        setErrorMsg('Invalid user role. Please contact support.');
        return;
      }

      // Store login data
      login(res.data);
      
      // Close modal only on successful login
      if (onClose) onClose();
      
      // Navigate based on role with strict role checking
      const role = userRole.toLowerCase();
      let redirectPath = '/user-dashboard';
      
      if (role === 'admin') {
        redirectPath = '/dashboard';
        console.log('🧭 Redirecting to admin dashboard:', redirectPath);
      } else if (role === 'customer') {
        redirectPath = '/user-dashboard';
        console.log('🧭 Redirecting to customer dashboard:', redirectPath);
      }
      
      // Navigate to appropriate dashboard
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);

    } catch (err) {
      console.error('? Login error:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setErrorMsg('Cannot connect to server. Please make sure the backend is running.');
      } else if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setErrorMsg(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setErrorMsg('No response from server. Please try again.');
      } else {
        console.error('Error setting up request:', err.message);
        setErrorMsg('Error setting up request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <div className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-700">
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-gray-900">K</span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Welcome Back</h2>
        <p className="text-gray-400">Sign in to continue</p>
      </div>
      <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-600 bg-gray-700">
        <button className="flex-1 bg-yellow-500 text-gray-900 font-semibold p-3 focus:outline-none">
          Log In
        </button>
        <button
          className="flex-1 bg-transparent text-gray-300 font-semibold p-3 focus:outline-none hover:text-white transition-colors"
          onClick={onSwitchToSignup}
        >
          Sign Up
        </button>
      </div>
      
      {/* Login Method Toggle */}
      <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
        <button
          type="button"
          onClick={() => setLoginMethod('password')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'password'
              ? 'bg-yellow-500 text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('otp')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            loginMethod === 'otp'
              ? 'bg-yellow-500 text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Email OTP
        </button>
      </div>
      
      <form onSubmit={loginMethod === 'password' ? handleSubmit : handleOTPLogin} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
            required
          />
        </div>
        {loginMethod === 'password' && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
        
        {loginMethod === 'otp' && (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-2">
              We'll send a 6-digit verification code to your email
            </p>
          </div>
        )}
        {errorMsg && <div className="text-red-400 text-sm text-center -mt-1">{errorMsg}</div>}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-yellow-500 text-gray-900 font-bold p-3 rounded-full mt-2 transition shadow-lg flex items-center justify-center ${
            submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-400 transform hover:scale-105'
          }`}
        >
          {submitting ? (
            <>
              <div className="relative mr-3">
                <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
                </div>
              </div>
              {loginMethod === 'password' ? 'Logging in...' : 'Sending OTP...'}
            </>
          ) : (
            loginMethod === 'password' ? 'Login' : 'Send OTP'
          )}
        </button>
        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <span
            className="text-yellow-400 font-semibold hover:text-yellow-300 cursor-pointer transition-colors"
            onClick={onSwitchToSignup}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {content}
      </div>
      
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        userId={pendingUserId}
        onVerificationSuccess={handleOTPVerificationSuccess}
        type="login"
      />
    </>
  );
};

export default Login;
