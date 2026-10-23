const express = require("express");

const {
    applyCoupon
} = require("../controllers/couponController");

const router = express.Router();

// POST /api/coupons/apply
// Validate a coupon and calculate the discount
router.post("/apply", applyCoupon);

module.exports = router;