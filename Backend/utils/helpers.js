const bcrypt = require('bcryptjs');

const generateOrderNumber = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const generateGroupOrderId = () => {
  return `GRP${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const formatDate = (date) => {
  return new Date(date).toISOString();
};

const getPaginationInfo = (page = 1, limit = 10, total) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = parseInt(page);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    total
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};

const handleSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error'
  });
};

module.exports = {
  generateOrderNumber,
  generateGroupOrderId,
  calculateTotalAmount,
  hashPassword,
  comparePasswords,
  formatDate,
  getPaginationInfo,
  sanitizeUser,
  handleSuccess,
  handleError
};