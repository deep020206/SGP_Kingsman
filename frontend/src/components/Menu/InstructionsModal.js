import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedInstructions(selectedInstructions || []);
      setLocalCustomInstructions(customInstructions || '');
    }
  }, [isOpen, selectedInstructions, customInstructions]);

  const handleInstructionToggle = (instruction) => {
    const isSelected = localSelectedInstructions.some(inst => inst.name === instruction.name);
    
    if (isSelected) {
      setLocalSelectedInstructions(prev => 
        prev.filter(inst => inst.name !== instruction.name)
      );
    } else {
      setLocalSelectedInstructions(prev => [...prev, instruction]);
    }
  };

  const handleSave = () => {
    onInstructionsChange(localSelectedInstructions);
    onCustomInstructionsChange(localCustomInstructions);
    onClose();
  };

  const calculateTotalPrice = () => {
    const basePrice = menuItem?.price || 0;
    const instructionPrice = localSelectedInstructions.reduce((total, inst) => total + (inst.priceModifier || 0), 0);
    return basePrice + instructionPrice;
  };

  if (!isOpen || !menuItem) return null;

  const availableInstructions = menuItem.availableInstructions || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Customize {menuItem.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Base Item Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{menuItem.name}</span>
              <span className="text-gray-600">₹{menuItem.price}</span>
            </div>
            {menuItem.description && (
              <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
            )}
          </div>

          {/* Available Instructions */}
          {availableInstructions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Available Add-ons & Modifications</h4>
              <div className="space-y-2">
                {availableInstructions.map((instruction, index) => {
                  const isSelected = localSelectedInstructions.some(inst => inst.name === instruction.name);
                  const priceDisplay = instruction.priceModifier > 0 
                    ? `+₹${instruction.priceModifier}` 
                    : instruction.priceModifier < 0 
                    ? `-₹${Math.abs(instruction.priceModifier)}` 
                    : 'Free';

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInstructionToggle(instruction)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 border-2 rounded mr-3 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{instruction.name}</span>
                          <span className={`ml-2 text-sm ${
                            instruction.priceModifier > 0 
                              ? 'text-green-600' 
                              : instruction.priceModifier < 0 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}>
                            {priceDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Instructions */}
          <div>
            <h4 className="font-medium mb-3">Special Instructions</h4>
            <textarea
              value={localCustomInstructions}
              onChange={(e) => setLocalCustomInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., 'Extra crispy', 'No salt', 'On the side')"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {localCustomInstructions.length}/200 characters
            </p>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Price:</span>
              <span className="text-lg font-bold text-green-600">
                ₹{calculateTotalPrice()}
              </span>
            </div>
            {localSelectedInstructions.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Base: ₹{menuItem.price} + Add-ons: ₹{localSelectedInstructions.reduce((total, inst) => total + (inst.priceModifier || 0), 0)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
