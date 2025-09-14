import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from './AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Login = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      
      if (!userRole || !['vendor', 'student'].includes(userRole.toLowerCase())) {
        console.error('❌ Invalid user role:', userRole);
        setErrorMsg('Invalid user role. Please contact support.');
        return;
      }

      // Store login data
      login(res.data);
      
      // Close modal if it exists
      if (onClose) onClose();
      
      // Navigate based on role with strict role checking
      const role = userRole.toLowerCase();
      let redirectPath = '/user-dashboard';
      
      if (role === 'vendor') {
        redirectPath = '/dashboard';
        console.log('🧭 Redirecting to vendor dashboard:', redirectPath);
      } else if (role === 'student') {
        redirectPath = '/user-dashboard';
        console.log('🧭 Redirecting to student dashboard:', redirectPath);
      }
      
      // Force redirect with a clean navigation
      window.location.href = redirectPath;

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
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
            required
          />
        </div>
        {errorMsg && <div className="text-red-400 text-sm text-center -mt-1">{errorMsg}</div>}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-yellow-500 text-gray-900 font-bold p-3 rounded-full mt-2 transition shadow-lg ${
            submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-yellow-400'
          }`}
        >
          {submitting ? 'Logging in...' : 'Login'}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {content}
    </div>
  );
};

export default Login;
