const PromoCode = require('../models/PromoCode');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

class PromoCodeService {
  async createPromoCode(data) {
    // Validate dates
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new ValidationError('End date must be after start date');
    }

    // Validate discount value
    if (data.type === 'percentage' && (data.value < 0 || data.value > 100)) {
      throw new ValidationError('Percentage discount must be between 0 and 100');
    }

    const promoCode = await PromoCode.create(data);
    logger.info('Promo code created', { code: promoCode.code });
    return promoCode;
  }

  async validatePromoCode(code, orderAmount, items) {
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!promoCode) {
      throw new ValidationError('Invalid or expired promo code');
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      throw new ValidationError('Promo code has reached its usage limit');
    }

    // Check minimum order amount
    if (orderAmount < promoCode.minOrderAmount) {
      throw new ValidationError(
        `Minimum order amount of $${promoCode.minOrderAmount} required for this promo code`
      );
    }

    // Check item eligibility if applicable
    if (promoCode.applicableItems?.length > 0) {
      const eligibleItems = items.filter(item => 
        promoCode.applicableItems.includes(item.menuItem.toString())
      );

      if (eligibleItems.length === 0) {
        throw new ValidationError('No eligible items for this promo code');
      }
    }

    // Check category eligibility if applicable
    if (promoCode.applicableCategories?.length > 0) {
      const eligibleItems = items.filter(item =>
        promoCode.applicableCategories.includes(item.menuItem.category)
      );

      if (eligibleItems.length === 0) {
        throw new ValidationError('No eligible categories for this promo code');
      }
    }

    return promoCode;
  }

  calculateDiscount(promoCode, orderAmount) {
    let discount = 0;

    if (promoCode.type === 'percentage') {
      discount = (orderAmount * promoCode.value) / 100;
    } else {
      discount = promoCode.value;
    }

    // Apply maximum discount limit if set
    if (promoCode.maxDiscount) {
      discount = Math.min(discount, promoCode.maxDiscount);
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);

    return parseFloat(discount.toFixed(2));
  }

  async usePromoCode(code) {
    const result = await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    logger.info('Promo code used', { 
      code, 
      usedCount: result.usedCount 
    });

    return result;
  }

  async listActivePromoCodes() {
    return PromoCode.find({
      isActive: true,
      endDate: { $gte: new Date() }
    }).sort('-createdAt');
  }

  async deactivatePromoCode(code) {
    const result = await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      { isActive: false },
      { new: true }
    );

    logger.info('Promo code deactivated', { code });
    return result;
  }
}

module.exports = new PromoCodeService();