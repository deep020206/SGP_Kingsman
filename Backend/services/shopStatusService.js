const ShopStatus = require('../models/ShopStatus');
const operatingHoursService = require('./operatingHoursService');
const logger = require('../utils/logger');

class ShopStatusService {
  async getCurrentStatus() {
    const status = await ShopStatus.getCurrentStatus();
    const isWithinOperatingHours = await operatingHoursService.isCurrentlyOpen();

    return {
      ...status.toObject(),
      isWithinOperatingHours,
      effectivelyOpen: status.isOpen && !status.manualClose && isWithinOperatingHours
    };
  }

  async updateStatus(updates, userId) {
    const status = await ShopStatus.findOneAndUpdate(
      {},
      {
        ...updates,
        lastUpdated: new Date(),
        updatedBy: userId
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    logger.info('Shop status updated', { 
      userId, 
      updates, 
      timestamp: new Date() 
    });

    return status;
  }

  async manuallyCloseShop(reason, reopenTime, userId) {
    const updates = {
      manualClose: true,
      manualCloseReason: reason,
      expectedReopenTime: reopenTime
    };

    const status = await this.updateStatus(updates, userId);

    logger.info('Shop manually closed', {
      reason,
      reopenTime,
      userId,
      timestamp: new Date()
    });

    return status;
  }

  async reopenShop(userId) {
    const updates = {
      manualClose: false,
      manualCloseReason: null,
      expectedReopenTime: null
    };

    const status = await this.updateStatus(updates, userId);

    logger.info('Shop reopened', {
      userId,
      timestamp: new Date()
    });

    return status;
  }

  async updateMinimumOrder(amount, userId) {
    const updates = {
      minimumOrderAmount: amount
    };

    const status = await this.updateStatus(updates, userId);

    logger.info('Minimum order amount updated', {
      amount,
      userId,
      timestamp: new Date()
    });

    return status;
  }

  async getOrderingStatus() {
    const status = await this.getCurrentStatus();
    const nextOpenTime = await operatingHoursService.getNextOpenTime();

    return {
      canAcceptOrders: status.effectivelyOpen && status.orderingEnabled,
      minimumOrderAmount: status.minimumOrderAmount,
      maxOrdersPerSlot: status.maxOrdersPerSlot,
      notice: status.notice,
      nextOpenTime: status.manualClose ? status.expectedReopenTime : nextOpenTime
    };
  }
}

module.exports = new ShopStatusService();