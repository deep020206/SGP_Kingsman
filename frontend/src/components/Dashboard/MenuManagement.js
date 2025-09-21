import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../Auth/AuthContext';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define categories
const FOOD_CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Snacks',
  'Pizza',
  'Burger',
  'Rice',
  'Bread',
  'Sides'
];

const MenuManagement = ({ isDarkMode, menuItems: initialMenuItems, onMenuItemsUpdate }) => {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localMenuItems, setLocalMenuItems] = useState([]);
  
  // Ensure menuItems is always an array
  React.useEffect(() => {
    const items = Array.isArray(initialMenuItems) ? initialMenuItems : [];
    setLocalMenuItems(items);
  }, [initialMenuItems]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: FOOD_CATEGORIES[0], // Default to first category
    image: '',
    imageFile: null,
    imagePreview: null,
    isAvailable: true,
    preparationTime: '30',
    ingredients: [],
    isVegetarian: false,
    spiceLevel: 'medium'
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: FOOD_CATEGORIES[0],
      image: '',
      isAvailable: true,
      preparationTime: '30',
      ingredients: [],
      isVegetarian: false,
      spiceLevel: 'medium'
    });
    setShowAddForm(false);
    setEditingItem(null);
    setError('');
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload an image file');
          return;
        }

        // Validate file size (3MB limit)
        if (file.size > 3 * 1024 * 1024) {
          setError('Image size must be less than 3MB');
          return;
        }

        try {
          // Compress image before converting to base64
          const compressedImage = await compressImage(file);
          const reader = new FileReader();
          
          reader.onloadend = () => {
            setFormData(prev => ({
              ...prev,
              image: reader.result,
              imagePreview: reader.result
            }));
            setError('');
          };
          
          reader.onerror = () => {
            setError('Error processing image');
          };
          
          reader.readAsDataURL(compressedImage);
        } catch (err) {
          setError('Error processing image');
          console.error('Image processing error:', err);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Image compression function
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxSize = 800;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.5 // Compression quality (0.5 = 50% quality)
          );
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imageFile: null,
      imagePreview: null
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result // Store base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        throw new Error('Valid price is required');
      }
      if (!formData.category?.trim()) {
        throw new Error('Category is required');
      }

      // If image size is too large
      if (formData.image) {
        const approximateSize = Math.ceil((formData.image.length - 'data:image/jpeg;base64,'.length) * 0.75);
        if (approximateSize > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Image size must be less than 5MB');
        }
      }

      // Prepare data with proper types
      const preparedData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description?.trim() || '',
        category: formData.category.trim(),
        image: formData.image || '',
        isAvailable: Boolean(formData.isAvailable),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : 30,
        isVegetarian: Boolean(formData.isVegetarian),
        spiceLevel: formData.spiceLevel || 'medium',
        ingredients: formData.ingredients?.filter(i => i.trim()) || []
      };

      // Validate image size if present
      if (formData.imageFile && formData.imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Remove the imageFile and imagePreview from the data sent to server
      const dataToSend = {
        ...preparedData,
        image: formData.image, // This will be the base64 string
        imageFile: undefined,
        imagePreview: undefined
      };

      console.log('Submitting form data:', dataToSend);
      if (editingItem) {
        // Update existing item
        const response = await api.put(
          `/vendor/menu-items/${editingItem._id}`,
          dataToSend,
          { 
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }
        );
        console.log('✅ Menu item updated:', response.data);
      } else {
        // Add new item
        console.log('Adding new menu item with data:', preparedData);
        const response = await api.post(
          '/menu',
          dataToSend,
          { 
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }
        );
        console.log('✅ Menu item added:', response.data);
      }
      
      // Refresh menu items
      if (onMenuItemsUpdate) {
        onMenuItemsUpdate();
      }
      resetForm();
    } catch (error) {
      console.error('❌ Error saving menu item:', error);
      let errorMessage = 'Failed to save menu item';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Internal server error. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      category: item.category || '',
      image: item.image || '',
      isAvailable: item.isAvailable !== false
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Send delete request to backend
      await api.delete(`/vendor/menu-items/${itemId}`);
      console.log('✅ Menu item deleted');
      
      // Update local state immediately
      setLocalMenuItems(currentItems => 
        currentItems.filter(item => item._id !== itemId)
      );
      
      // Notify parent to refresh data
      if (onMenuItemsUpdate) {
        await onMenuItemsUpdate();
      }
      
      // Show success message
      setError('Item deleted successfully');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      setError(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentAvailability) => {
    setLoading(true);
    setError('');
    
    try {
      // Send availability toggle request to backend
      await api.patch(`/vendor/menu-items/${itemId}/availability`);
      console.log('✅ Menu item availability toggled');
      
      // Update local state immediately
      setLocalMenuItems(currentItems => 
        currentItems.map(item => 
          item._id === itemId 
            ? { ...item, isAvailable: !currentAvailability }
            : item
        )
      );
      
      // Notify parent to refresh data
      if (onMenuItemsUpdate) {
        await onMenuItemsUpdate();
      }
      
      // Show success message
      const newStatus = !currentAvailability ? 'available' : 'unavailable';
      setError(`Item marked as ${newStatus} successfully`);
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('❌ Error toggling availability:', error);
      setError(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className={`flex items-center px-6 py-3 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors font-semibold shadow-lg border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>



      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6 mb-6`}
        >
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item Name"
                required
                className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price (₹)"
                required
                min="0"
                step="0.01"
                className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              >
                {FOOD_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="flex flex-col space-y-2">
                <label className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
                  Image (optional)
                </label>
                <div className="flex items-center space-x-2">
                  <label className={`cursor-pointer px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}>
                    <span>{selectedFile ? 'Change Image' : 'Choose Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                rows="3"
                className={`md:col-span-2 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Available for orders
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'} transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {localMenuItems.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg`}>
            <div className={`mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <PlusIcon className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <p className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No menu items yet</p>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start building your menu by adding your first item</p>
            <button
              onClick={() => {
                console.log('🍽️ Empty state Add Item button clicked!');
                setShowAddForm(true);
              }}
              className={`inline-flex items-center px-6 py-3 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors font-semibold shadow-lg`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Item
            </button>
          </div>
        ) : localMenuItems.map((item, index) => (
          <motion.div
            key={item._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                <p className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price}</p>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  disabled={loading}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={loading}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => toggleAvailability(item._id, item.isAvailable)}
                disabled={loading}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                  item.isAvailable
                    ? `${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`
                    : `${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`
                }`}
              >
                {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;
