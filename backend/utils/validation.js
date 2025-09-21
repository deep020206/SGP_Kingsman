const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateMenuItem = (item) => {
  const errors = [];
  
  if (!item.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (typeof item.price !== 'number' || item.price <= 0) {
    errors.push('Price must be a positive number');
  }
  
  if (!item.category?.trim()) {
    errors.push('Category is required');
  }
  
  if (item.preparationTime && (typeof item.preparationTime !== 'number' || item.preparationTime <= 0)) {
    errors.push('Preparation time must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOrder = (order) => {
  const errors = [];
  
  if (!order.userId) {
    errors.push('User ID is required');
  }
  
  if (!order.vendorId) {
    errors.push('Vendor ID is required');
  }
  
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!order.deliveryAddress?.trim()) {
    errors.push('Delivery address is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateMenuItem,
  validateOrder
};