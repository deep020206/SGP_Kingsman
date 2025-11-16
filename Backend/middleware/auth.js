const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      throw new Error();
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const vendorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId, 
      role: { $in: ['vendor', 'admin'] }, // Allow both vendor and admin roles
      isActive: true 
    });

    if (!user) {
      return res.status(403).json({ message: 'Access denied. Vendor/Admin access required.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const customerAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId, 
      role: 'customer',
      isActive: true 
    });

    if (!user) {
      return res.status(403).json({ message: 'Access denied. Customer access required.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = { auth, vendorAuth, customerAuth, generateToken };
