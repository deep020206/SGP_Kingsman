import React, { useState } from 'react';
import axios from 'axios';

const AddMenuItemForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5001/api/vendor/menu-items', {
        name,
        price,
        category,
        isAvailable: isAvailable === true || isAvailable === 'true',
        image,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAdd(res.data);
      setName('');
      setPrice('');
      setCategory('');
      setIsAvailable(true);
      setImage(null);
    } catch (err) {
      setError('Failed to add item');
    }
    setLoading(false);
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