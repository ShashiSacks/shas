const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true
        },

        discountValue: {
            type: Number,
            required: true,
            min: [0.01, "Discount must be greater than zero"]
        },

        minimumOrderValue: {
            type: Number,
            default: 0,
            min: [0, "Minimum order value cannot be negative"]
        },

        maximumDiscount: {
            type: Number,
            default: null,
            min: [0, "Maximum discount cannot be negative"]
        },

        expiryDate: {
            type: Date,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Validate discount values before saving
couponSchema.pre("validate", function () {
    if (
        this.discountType === "percentage" &&
        this.discountValue > 100
    ) {
        this.invalidate(
            "discountValue",
            "Percentage discount cannot exceed 100"
        );
    }
});

module.exports = mongoose.model("Coupon", couponSchema);