import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/menu');
        setItems(res.data);
      } catch (err) {
        setError('Failed to load menu');
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{item.name}</h3>
              <p>₹{item.price}</p>
              <p className={item.isAvailable ? 'text-green-500' : 'text-red-500'}>
                {item.isAvailable ? 'Available' : 'Out of Stock'}
              </p>
              <p>Category: {item.category}</p>
              <p>Vendor: {item.vendorId?.name}</p>
              <p>Rating: {item.avgRating || 0} ({item.ratingCount || 0})</p>
              {/* Add to Cart button and logic can be added here */}
              <button className="mt-2 bg-yellow-500 text-white p-2 rounded">Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
