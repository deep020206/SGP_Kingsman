import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InstructionsModal = ({ 
  isOpen, 
  onClose, 
  menuItem, 
  selectedInstructions, 
  onInstructionsChange,
  customInstructions,
  onCustomInstructionsChange 
}) => {
  const [localSelectedInstructions, setLocalSelectedInstructions] = useState(selectedInstructions || []);
  const [localCustomInstructions, setLocalCustomInstructions] = useState(customInstructions || '');

  const customizationOptions = [
    { id: 1, name: 'Extra Cheese', price: 30 },
    { id: 2, name: 'Extra Veggies', price: 25 },
    { id: 3, name: 'Extra Spicy', price: 10 },
    { id: 4, name: 'Extra Mayo', price: 15 },
    { id: 5, name: 'Extra Sauce', price: 20 }
  ];

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedInstructions(selectedInstructions || []);
      setLocalCustomInstructions(customInstructions || '');
    }
  }, [isOpen, selectedInstructions, customInstructions]);

  const handleInstructionToggle = (option) => {
    const isSelected = localSelectedInstructions.some(inst => inst.id === option.id);
    
    if (isSelected) {
      setLocalSelectedInstructions(prev => 
        prev.filter(inst => inst.id !== option.id)
      );
    } else {
      setLocalSelectedInstructions(prev => [...prev, option]);
    }
  };

  const handleSave = () => {
    onInstructionsChange(localSelectedInstructions, localCustomInstructions);
    onClose();
  };

  const calculateTotalPrice = () => {
    const basePrice = menuItem?.price || 0;
    const customizationsPrice = localSelectedInstructions.reduce((total, inst) => total + (inst.price || 0), 0);
    return basePrice + customizationsPrice;
  };

  if (!isOpen || !menuItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customize {menuItem.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">{menuItem.description}</p>
        <p className="text-xl font-bold text-gray-800 mb-4">Base Price: ₹{menuItem.price}</p>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Add Extra Items:</h3>
          <div className="space-y-3">
            {customizationOptions.map((option) => (
              <label key={option.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSelectedInstructions.some(inst => inst.id === option.id)}
                    onChange={() => handleInstructionToggle(option)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="ml-3">{option.name}</span>
                </div>
                <span className="text-green-600">+₹{option.price}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Special Instructions</h3>
          <textarea
            value={localCustomInstructions}
            onChange={(e) => setLocalCustomInstructions(e.target.value)}
            placeholder="Any special requests? (e.g., 'Extra crispy', 'No salt', 'On the side')"
            className="w-full p-3 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            rows="3"
            maxLength="200"
          />
          <p className="text-sm text-gray-500 mt-1">
            {localCustomInstructions.length}/200 characters
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Price:</span>
            <span>₹{calculateTotalPrice()}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
