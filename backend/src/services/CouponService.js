const Coupon = require("../models/Coupon");

class CouponService {
    // Validate a coupon and calculate the discount
    async applyCoupon(code, subtotal) {
        // Validate coupon code
        if (
            typeof code !== "string" ||
            code.trim().length === 0 ||
            code.trim().length > 50
        ) {
            const error = new Error("Please provide a valid coupon code");
            error.statusCode = 400;
            throw error;
        }

        // Validate subtotal
        if (!Number.isFinite(subtotal) || subtotal < 0) {
            const error = new Error("Invalid order subtotal");
            error.statusCode = 400;
            throw error;
        }

        // Find an active coupon
        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            const error = new Error("Invalid or inactive coupon");
            error.statusCode = 400;
            throw error;
        }

        // Check coupon expiry
        if (
            coupon.expiryDate &&
            coupon.expiryDate.getTime() <= Date.now()
        ) {
            const error = new Error("This coupon has expired");
            error.statusCode = 400;
            throw error;
        }

        // Check minimum order value
        if (subtotal < coupon.minimumOrderValue) {
            const error = new Error(
                `Minimum order value is ₹${coupon.minimumOrderValue}`
            );
            error.statusCode = 400;
            throw error;
        }

        // Calculate discount
        let discount;

        if (coupon.discountType === "percentage") {
            discount = subtotal * (coupon.discountValue / 100);
        } else if (coupon.discountType === "fixed") {
            discount = coupon.discountValue;
        } else {
            const error = new Error("Unsupported coupon discount type");
            error.statusCode = 400;
            throw error;
        }

        // Apply maximum discount cap when configured
        if (coupon.maximumDiscount !== null) {
            discount = Math.min(discount, coupon.maximumDiscount);
        }

        // Discount cannot exceed subtotal
        discount = Math.min(discount, subtotal);

        // Round monetary amounts to two decimal places
        discount = Number(discount.toFixed(2));

        const total = Number((subtotal - discount).toFixed(2));

        return {
            couponCode: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            subtotal: Number(subtotal.toFixed(2)),
            discount,
            total
        };
    }
}

module.exports = new CouponService();