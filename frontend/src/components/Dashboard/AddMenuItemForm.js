import React, { useState } from 'react';
import MenuManagementService from '../../services/menu/menuManagementService';

const AddMenuItemForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const menuService = new MenuManagementService();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError(''); // Clear any previous errors
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const menuItemData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        isAvailable: isAvailable === true || isAvailable === 'true',
        image: image || '' // Include image (base64) or empty string
      };

      console.log('🍕 Submitting menu item:', menuItemData);

      const result = await menuService.addMenuItem(menuItemData);
      const menuItem = result.menuItem || result;
      
      console.log('✅ Menu item added successfully:', result);
      
      // Call onAdd callback with the new item
      if (onAdd && typeof onAdd === 'function') {
        onAdd(menuItem);
      }
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setIsAvailable(true);
      setImage(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      console.error('❌ Failed to add menu item:', err);
      setError(err.message || 'Failed to add menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-yellow-200 p-6 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row md:items-end gap-4">
      <div className="flex-1">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Item Name" className="w-full p-2 border rounded mb-2" required />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded mb-2" required />
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full p-2 border rounded mb-2" required />
        <select value={isAvailable ? 'true' : 'false'} onChange={e => setIsAvailable(e.target.value === 'true')} className="w-full p-2 border rounded mb-2">
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border rounded mb-2" />
        {image && <img src={image} alt="Preview" className="w-24 h-24 object-cover rounded mb-2 border" />}
      </div>
      <button type="submit" className="bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow hover:bg-yellow-600 transition" disabled={loading}>{loading ? 'Adding...' : 'Add Item'}</button>
      {error && <p className="text-red-500 ml-4">{error}</p>}
    </form>
  );
};

export default AddMenuItemForm; 