const mongoose = require("mongoose");
const cartService = require("../services/CartService");

// Extract and validate the cart session ID
function getSessionId(req) {
    const sessionId = req.header("x-cart-session");

    if (
        typeof sessionId !== "string" ||
        sessionId.trim().length < 8 ||
        sessionId.trim().length > 100
    ) {
        const error = new Error(
            "Provide a valid cart session using the x-cart-session header"
        );
        error.statusCode = 400;
        throw error;
    }

    return sessionId.trim();
}

// GET /api/cart
const getCart = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        const cart = await cartService.getCart(sessionId);

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/cart/items
const addItem = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        const { productId, quantity = 1 } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number"
            });
        }

        const cart = await cartService.addItem(
            sessionId,
            productId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/cart/items/:productId
const updateItem = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number"
            });
        }

        const cart = await cartService.updateItem(
            sessionId,
            productId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/cart/items/:productId
const removeItem = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const cart = await cartService.removeItem(
            sessionId,
            productId
        );

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/cart
const clearCart = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        const cart = await cartService.clearCart(sessionId);

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
};