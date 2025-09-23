const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Menu item name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid price'
    }
  },
  customizations: [{
    name: String,
    price: Number,
    available: {
      type: Boolean,
      default: true
    }
  }],
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true
  },
  image: { 
    type: String,
    validate: {
      validator: function(v) {
        // Accept either HTTP/HTTPS URLs or base64 data URLs
        if (!v) return true; // Allow empty values
        
        // Check for valid HTTP/HTTPS URL
        const urlPattern = /^https?:\/\/.+/;
        
        // Check for valid base64 data URL - simplified pattern
        const dataUrlPattern = /^data:image\/.+;base64,/;
        
        return urlPattern.test(v) || dataUrlPattern.test(v);
      },
      message: props => `${props.value} is not a valid image URL or base64 data URL`
    }
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  preparationTime: { 
    type: Number, 
    default: 30,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [180, 'Preparation time cannot exceed 180 minutes']
  },
  ingredients: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.every(ingredient => ingredient.trim().length > 0);
      },
      message: 'Ingredients cannot be empty strings'
    }
  },
  isVegetarian: { 
    type: Boolean, 
    default: false 
  },
  spiceLevel: { 
    type: String, 
    enum: {
      values: ['mild', 'medium', 'spicy'],
      message: '{VALUE} is not a valid spice level'
    },
    default: 'medium'
  },
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Vendor ID is required']
  },
  availableInstructions: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    priceModifier: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isFinite,
        message: 'Price modifier must be a valid number'
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ['addon', 'modification', 'custom'],
      default: 'addon'
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

menuItemSchema.index({ vendorId: 1, category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);