const express = require("express");

const {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
} = require("../controllers/cartController");

const router = express.Router();

// GET /api/cart
// Retrieve the current cart
router.get("/", getCart);

// POST /api/cart/items
// Add a product to the cart
router.post("/items", addItem);

// PATCH /api/cart/items/:productId
// Update a product's quantity
router.patch("/items/:productId", updateItem);

// DELETE /api/cart/items/:productId
// Remove a product from the cart
router.delete("/items/:productId", removeItem);

// DELETE /api/cart
// Remove all items from the cart
router.delete("/", clearCart);

module.exports = router;