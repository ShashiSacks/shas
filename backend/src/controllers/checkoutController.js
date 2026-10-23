const checkoutService = require("../services/CheckoutService");

// POST /api/checkout
const checkout = async (req, res, next) => {
    try {
        // Get the cart session ID from the request header
        const sessionId = req.header("x-cart-session");

        if (
            typeof sessionId !== "string" ||
            sessionId.trim().length < 8 ||
            sessionId.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid cart session ID"
            });
        }

        // Get the optional coupon code
        const { couponCode } = req.body;

        if (
            couponCode !== undefined &&
            (
                typeof couponCode !== "string" ||
                couponCode.trim().length === 0 ||
                couponCode.trim().length > 50
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        // Execute checkout business logic
        const order = await checkoutService.checkout(
            sessionId.trim(),
            couponCode ? couponCode.trim() : null
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { checkout };