const express = require("express");

const { checkout } = require("../controllers/checkoutController");

const router = express.Router();

// POST /api/checkout
// Validate the cart and place an order
router.post("/", checkout);

module.exports = router;