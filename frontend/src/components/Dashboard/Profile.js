import React, { useState } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile = ({ isDarkMode, vendor = {} }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    role: vendor?.role || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put('/auth/profile', form);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-2xl shadow-lg w-full max-w-lg border`}
      >
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
            <UserIcon className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <h2 className={`text-2xl font-bold ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
        </div>
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                editMode 
                  ? isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            />
          </div>
          <div>
            <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                editMode 
                  ? isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            />
          </div>
          <div>
            <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                editMode 
                  ? isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            />
          </div>
          <div>
            <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                editMode 
                  ? isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                  : isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            />
          </div>
          <div>
            <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
            <input
              type="text"
              name="role"
              value={form.role}
              disabled
              className={`w-full p-3 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-400' 
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          {editMode ? (
            <>
              <button
                className={`px-6 py-2 rounded-lg font-bold shadow transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                onClick={() => setEditMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-bold shadow transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                    : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                }`}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              className={`flex items-center px-6 py-2 rounded-lg font-bold shadow transition-colors ${
                isDarkMode 
                  ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                  : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
              }`}
              onClick={() => setEditMode(true)}
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
