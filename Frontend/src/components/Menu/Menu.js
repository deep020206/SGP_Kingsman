import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InstructionsModal from './InstructionsModal';
import { API_URL } from '../../config/api';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/menu');
        setItems(res.data);
        const initialCustomizations = {};
        res.data.forEach(item => {
          initialCustomizations[item._id] = new Set();
        });
        setSelectedCustomizations(initialCustomizations);
      } catch (err) {
        console.error('Menu fetch error:', err);
        if (err.isNetworkError || err.code === 'ERR_NETWORK') {
          setError('Unable to load menu. Please check your internet connection and try again.');
        } else {
          setError(err.userMessage || 'Failed to load menu. Please try again.');
        }
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const retryFetchMenu = () => {
    const fetchMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/menu`);
        setItems(res.data);
        const initialCustomizations = {};
        res.data.forEach(item => {
          initialCustomizations[item._id] = new Set();
        });
        setSelectedCustomizations(initialCustomizations);
      } catch (err) {
        console.error('Menu retry fetch error:', err);
        if (err.isNetworkError || err.code === 'ERR_NETWORK') {
          setError('Unable to load menu. Please check your internet connection and try again.');
        } else {
          setError(err.userMessage || 'Failed to load menu. Please try again.');
        }
      }
      setLoading(false);
    };
    fetchMenu();
  };

  const calculateTotalPrice = (item) => {
    let total = item.price;
    if (selectedCustomizations[item._id]) {
      item.customizations?.forEach(customization => {
        if (selectedCustomizations[item._id].has(customization.name)) {
          total += customization.price;
        }
      });
    }
    return total;
  };

  const handleCustomizationSave = (instructions, specialInstructions) => {
    if (selectedItem) {
      const customizations = instructions.map(instruction => ({
        name: instruction.name,
        price: instruction.price
      }));

      const itemBasePrice = selectedItem.price;
      const customizationTotal = customizations.reduce((sum, c) => sum + c.price, 0);
      const totalItemPrice = itemBasePrice + customizationTotal;

      const newItem = {
        ...selectedItem,
        cartId: Date.now(), // Unique ID for cart item
        customizations: customizations,
        specialInstructions: specialInstructions,
        basePrice: itemBasePrice,
        customizationPrice: customizationTotal,
        totalPrice: totalItemPrice,
        quantity: 1
      };

      setCart(prevCart => {
        // Check if same item with same customizations exists
        const existingItemIndex = prevCart.findIndex(item => {
          const sameBase = item._id === newItem._id;
          const sameCustomizations = 
            JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations);
          const sameInstructions = item.specialInstructions === newItem.specialInstructions;
          return sameBase && sameCustomizations && sameInstructions;
        });

        if (existingItemIndex !== -1) {
          // If item exists, increase quantity
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += 1;
          return updatedCart;
        } else {
          // If item doesn't exist, add new item
          return [...prevCart, newItem];
        }
      });
      
      setSelectedCustomizations(prev => ({
        ...prev,
        [selectedItem._id]: new Set(instructions.map(i => i.name))
      }));
      setIsModalOpen(false);
    }
  };

  const addToCart = (item) => {
    if (item.customizations?.length > 0) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      const newItem = {
        ...item,
        cartId: Date.now(),
        totalPrice: item.price,
        quantity: 1
      };

      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(cartItem => 
          cartItem._id === item._id && !cartItem.customizations
        );

        if (existingItemIndex !== -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += 1;
          return updatedCart;
        } else {
          return [...prevCart, newItem];
        }
      });
    }
  };

  return (
  <div className="p-2 sm:p-6 max-w-7xl mx-auto bg-gradient-to-b from-yellow-50 via-white to-white min-h-screen">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-600 tracking-tight">Menu</h2>
        <div className="relative">
          {/* Mobile fixed cart button */}
          <button
            onClick={() => setCartVisible(!cartVisible)}
            className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 sm:static fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-xs sm:max-w-none sm:w-auto z-40 shadow-lg sm:shadow-none"
            style={{ display: 'block' }}
          >
            <span className="hidden sm:inline">Cart </span>
            <span>({cart.reduce((total, item) => total + item.quantity, 0)})</span>
            <span className="hidden sm:inline">₹{cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)}</span>
          </button>
          {/* Cart overlay and backdrop */}
          {cart.length > 0 && cartVisible && (
            <>
              {/* Backdrop for mobile */}
              <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
                onClick={() => setCartVisible(false)}
                aria-label="Close cart"
              ></div>
              <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto top-0 sm:top-auto sm:right-0 mt-0 sm:mt-2 w-full sm:w-96 h-full sm:h-auto bg-white rounded-t-2xl sm:rounded-lg shadow-xl z-50 p-4 flex flex-col max-h-[90vh] sm:max-h-[80vh]">
                <div className="sticky top-0 bg-white z-10 border-b pb-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Cart Items</h3>
                  <button 
                    onClick={() => setCartVisible(false)} 
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex flex-col border-b py-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.customizations?.map((custom, idx) => (
                          <p key={idx} className="text-sm text-gray-600">+ {custom.name} (₹{custom.price})</p>
                        ))}
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500 italic">{item.specialInstructions}</p>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                        <div className="flex items-center space-x-3">
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 active:bg-gray-400"
                            onClick={() => {
                              setCart(prevCart => {
                                const newCart = [...prevCart];
                                const itemIndex = newCart.findIndex(i => i.cartId === item.cartId);
                                if (itemIndex !== -1) {
                                  if (newCart[itemIndex].quantity > 1) {
                                    newCart[itemIndex].quantity -= 1;
                                    newCart[itemIndex].totalPrice = newCart[itemIndex].basePrice + 
                                      (newCart[itemIndex].customizationPrice || 0);
                                  } else {
                                    newCart.splice(itemIndex, 1);
                                    if (newCart.length === 0) setCartVisible(false);
                                  }
                                }
                                return newCart;
                              });
                            }}
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 active:bg-gray-400"
                            onClick={() => {
                              setCart(prevCart => {
                                const newCart = [...prevCart];
                                const itemIndex = newCart.findIndex(i => i.cartId === item.cartId);
                                if (itemIndex !== -1) {
                                  newCart[itemIndex].quantity += 1;
                                  newCart[itemIndex].totalPrice = newCart[itemIndex].basePrice + 
                                    (newCart[itemIndex].customizationPrice || 0);
                                }
                                return newCart;
                              });
                            }}
                          >
                            +
                          </button>
                        </div>
                        <p className="font-semibold text-right min-w-[80px]">₹{item.totalPrice * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                <div className="sticky bottom-0 bg-white pt-3 border-t mt-auto">
                <div className="flex justify-between items-center font-semibold text-lg mb-3">
                  <span>Total:</span>
                  <span>₹{cart.reduce((total, item) => total + (item.totalPrice * item.quantity), 0)}</span>
                </div>
                <button 
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 active:bg-green-700 font-medium"
                  onClick={() => {
                    // TODO: Implement checkout logic
                    alert('Proceed to checkout');
                  }}
                >
                  Proceed to Checkout
                </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retryFetchMenu}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="border border-yellow-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 bg-white flex flex-col h-full min-h-[210px] relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  {item.isAvailable ? (
                    <span className="inline-block bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">Available</span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">Out of Stock</span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 break-words text-gray-900">{item.name}</h3>
                <p className="text-gray-500 mb-2 text-sm break-words line-clamp-2">{item.description}</p>
                <div className="flex items-center mb-2">
                  <span className="text-lg sm:text-xl font-bold text-yellow-600">₹{calculateTotalPrice(item)}</span>
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg shadow-sm transition-all duration-200 text-sm sm:text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                    disabled={!item.isAvailable}
                  >
                    Customize
                  </button>
                  <button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg shadow-sm transition-all duration-200 disabled:bg-gray-300 text-sm sm:text-base font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <InstructionsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            menuItem={selectedItem}
            selectedInstructions={selectedItem ? Array.from(selectedCustomizations[selectedItem._id] || []).map(name => ({
              name,
              price: selectedItem.customizations.find(c => c.name === name)?.price || 0
            })) : []}
            onInstructionsChange={handleCustomizationSave}
            customInstructions=""
            onCustomInstructionsChange={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default Menu;
