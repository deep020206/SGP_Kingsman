const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    unique: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  closeTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  breakStart: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  breakEnd: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Time must be in HH:MM format'
    }
  },
  specialHours: Boolean,
  note: String
});

// Ensure all days of the week are represented
operatingHoursSchema.statics.initializeDefaultHours = async function() {
  const defaultHours = {
    openTime: '09:00',
    closeTime: '22:00',
    isOpen: true
  };

  for (let i = 0; i < 7; i++) {
    const existing = await this.findOne({ dayOfWeek: i });
    if (!existing) {
      await this.create({ ...defaultHours, dayOfWeek: i });
    }
  }
};

module.exports = mongoose.model('OperatingHours', operatingHoursSchema);