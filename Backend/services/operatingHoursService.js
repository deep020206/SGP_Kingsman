const OperatingHours = require('../models/OperatingHours');
const { ValidationError } = require('../utils/errors');

class OperatingHoursService {
  // Get all operating hours
  async getAllHours() {
    return OperatingHours.find().sort('dayOfWeek');
  }

  // Get operating hours for specific day
  async getHoursForDay(dayOfWeek) {
    return OperatingHours.findOne({ dayOfWeek });
  }

  // Update operating hours for a day
  async updateHours(dayOfWeek, updates) {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (updates.openTime && !timeRegex.test(updates.openTime)) {
      throw new ValidationError('Invalid open time format. Use HH:MM');
    }
    
    if (updates.closeTime && !timeRegex.test(updates.closeTime)) {
      throw new ValidationError('Invalid close time format. Use HH:MM');
    }

    // Validate break times if provided
    if (updates.breakStart && !timeRegex.test(updates.breakStart)) {
      throw new ValidationError('Invalid break start time format. Use HH:MM');
    }

    if (updates.breakEnd && !timeRegex.test(updates.breakEnd)) {
      throw new ValidationError('Invalid break end time format. Use HH:MM');
    }

    // Update the hours
    const hours = await OperatingHours.findOneAndUpdate(
      { dayOfWeek },
      updates,
      { new: true, runValidators: true }
    );

    if (!hours) {
      throw new Error('Operating hours not found for this day');
    }

    return hours;
  }

  // Check if restaurant is currently open
  async isCurrentlyOpen() {
    const now = new Date();
    const currentDay = now.getDay() || 7; // Convert 0 (Sunday) to 7
    const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

    const hours = await this.getHoursForDay(currentDay);
    
    if (!hours || !hours.isOpen) {
      return false;
    }

    // Convert times to minutes for comparison
    const current = this.timeToMinutes(currentTime);
    const open = this.timeToMinutes(hours.openTime);
    const close = this.timeToMinutes(hours.closeTime);

    // Check if within break time
    if (hours.breakStart && hours.breakEnd) {
      const breakStart = this.timeToMinutes(hours.breakStart);
      const breakEnd = this.timeToMinutes(hours.breakEnd);
      
      // Check if current time is during break
      if (breakStart <= current && current <= breakEnd) {
        return false;
      }
    }

    // Handle overnight hours
    if (close < open) {
      return current >= open || current <= close;
    }

    return current >= open && current <= close;
  }

  // Convert HH:MM to minutes for easier comparison
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Initialize default hours if not set
  async initializeDefaultHours() {
    await OperatingHours.initializeDefaultHours();
  }

  // Get next open time
  async getNextOpenTime() {
    const now = new Date();
    const currentDay = now.getDay() || 7; // Convert 0 (Sunday) to 7
    const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    const currentMinutes = this.timeToMinutes(currentTime);
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7 || 7; // 0 becomes 7 for Sunday
      const hours = await this.getHoursForDay(checkDay);
      
      if (hours && hours.isOpen) {
        const openMinutes = this.timeToMinutes(hours.openTime);
        const closeMinutes = this.timeToMinutes(hours.closeTime);
        
        if (i === 0) {
          // Today - check if we haven't passed closing time
          // For normal hours
          if (closeMinutes > openMinutes) {
            if (currentMinutes < closeMinutes) {
              return {
                day: checkDay,
                time: currentMinutes < openMinutes ? hours.openTime : hours.closeTime,
                isToday: true
              };
            }
          }
          // For overnight hours
          else if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
            return {
              day: checkDay,
              time: hours.openTime,
              isToday: true
            };
          }
        } else {
          // Future day - always return opening time
          return {
            day: checkDay,
            time: hours.openTime,
            isToday: false
          };
        }
      }
    }
    
    return null; // No open times found in next 7 days
  }
}

module.exports = new OperatingHoursService();