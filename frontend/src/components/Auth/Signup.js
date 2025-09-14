
import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Signup = ({ onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5001/api/auth/register',
        {
          name,
          email,
          password,
          phone,
          role,
          address,
        }
      );
      if (res.data && res.data.message === 'User created successfully') {
        alert('Signup successful! Please login.');
        if (onSwitchToLogin) onSwitchToLogin();
        if (onClose) onClose();
      } else {
        alert(res.data.message || 'Signup failed');
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Signup failed. Please try again.'
      );
    }
  };

  const content = (
    <div className="bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700">
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
      <div className="text-center mb-4">
        <div className="mx-auto w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
          <span className="text-xl font-bold text-gray-900">K</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-2">Get Started now</h2>
        <p className="text-gray-400 text-sm">Create an account or log in to explore</p>
      </div>
      <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-600 bg-gray-700">
        <button
          className="flex-1 bg-transparent text-gray-300 font-semibold p-2 focus:outline-none hover:text-white transition-colors text-sm"
          onClick={onSwitchToLogin}
        >
          Log In
        </button>
        <button
          className="flex-1 bg-yellow-500 text-gray-900 font-semibold p-2 focus:outline-none text-sm"
        >
          Sign Up
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400 text-sm"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400 text-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400 text-sm"
          required
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400 text-sm"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white text-sm"
          required
        >
          <option value="student">Student</option>
          <option value="vendor">Vendor</option>
        </select>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400 text-sm"
        />
        <button type="submit" className="w-full bg-yellow-500 text-gray-900 font-bold p-2 rounded-full mt-3 transition hover:bg-yellow-400 shadow-lg text-sm">
          Sign Up
        </button>
        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <span
            className="text-yellow-400 font-semibold hover:text-yellow-300 cursor-pointer transition-colors"
            onClick={onSwitchToLogin}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );

  if (onClose) {
    // Modal mode
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  // Full page mode
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Signup;
