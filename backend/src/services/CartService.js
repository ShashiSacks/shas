const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartService {
    // Find an existing cart or create a new one
    async getOrCreateCart(sessionId) {
        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            cart = await Cart.create({
                sessionId,
                items: []
            });
        }

        return cart;
    }

    // Add a product to the cart
    async addItem(sessionId, productId, quantity = 1) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error("Quantity must be a positive whole number");
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            throw new Error("Product not found");
        }

        if (product.stock < quantity) {
            throw new Error("Insufficient product stock");
        }

        const cart = await this.getOrCreateCart(sessionId);

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                throw new Error("Requested quantity exceeds available stock");
            }

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                product: product._id,
                quantity
            });
        }

        await cart.save();

        return this.getCart(sessionId);
    }

    // Retrieve the cart with product details
    async getCart(sessionId) {
        const cart = await Cart.findOne({ sessionId })
            .populate("items.product", "name price image category stock");

        if (!cart) {
            return {
                sessionId,
                items: [],
                subtotal: 0
            };
        }

        const items = cart.items
            .filter((item) => item.product !== null)
            .map((item) => ({
                product: item.product,
                quantity: item.quantity,
                itemTotal: item.product.price * item.quantity
            }));

        const subtotal = items.reduce(
            (total, item) => total + item.itemTotal,
            0
        );

        return {
            sessionId: cart.sessionId,
            items,
            subtotal: Number(subtotal.toFixed(2))
        };
    }

    // Update a product's quantity
    async updateItem(sessionId, productId, quantity) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error("Quantity must be a positive whole number");
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            throw new Error("Product not found");
        }

        if (quantity > product.stock) {
            throw new Error("Requested quantity exceeds available stock");
        }

        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            throw new Error("Cart not found");
        }

        const item = cart.items.find(
            (entry) => entry.product.toString() === productId
        );

        if (!item) {
            throw new Error("Product is not in the cart");
        }

        item.quantity = quantity;

        await cart.save();

        return this.getCart(sessionId);
    }

    // Remove a product from the cart
    async removeItem(sessionId, productId) {
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            throw new Error("Cart not found");
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            throw new Error("Product is not in the cart");
        }

        await cart.save();

        return this.getCart(sessionId);
    }

    // Empty the entire cart
    async clearCart(sessionId) {
        const cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return {
                sessionId,
                items: [],
                subtotal: 0
            };
        }

        cart.items = [];

        await cart.save();

        return this.getCart(sessionId);
    }
}

module.exports = new CartService();