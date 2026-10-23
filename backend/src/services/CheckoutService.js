const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const cartService = require("./CartService");
const couponService = require("./CouponService");

class CheckoutService {
    async checkout(sessionId, couponCode = null) {
        const dbSession = await mongoose.startSession();

        try {
            let createdOrder;

            await dbSession.withTransaction(async () => {
                // 1. Retrieve the customer's cart
                const cart = await Cart.findOne({ sessionId })
                    .session(dbSession);

                if (!cart || cart.items.length === 0) {
                    const error = new Error("Your cart is empty");
                    error.statusCode = 400;
                    throw error;
                }

                // 2. Retrieve current product details from the database
                const productIds = cart.items.map((item) => item.product);

                const products = await Product.find({
                    _id: { $in: productIds },
                    isActive: true
                }).session(dbSession);

                const productMap = new Map(
                    products.map((product) => [
                        product._id.toString(),
                        product
                    ])
                );

                // 3. Validate products and stock; calculate subtotal
                const orderItems = [];
                let subtotal = 0;

                for (const cartItem of cart.items) {
                    const product = productMap.get(
                        cartItem.product.toString()
                    );

                    if (!product) {
                        const error = new Error(
                            "A product in your cart is unavailable"
                        );
                        error.statusCode = 400;
                        throw error;
                    }

                    if (cartItem.quantity > product.stock) {
                        const error = new Error(
                            `Insufficient stock for ${product.name}`
                        );
                        error.statusCode = 400;
                        throw error;
                    }

                    const itemTotal = Number(
                        (product.price * cartItem.quantity).toFixed(2)
                    );

                    subtotal = Number(
                        (subtotal + itemTotal).toFixed(2)
                    );

                    orderItems.push({
                        product: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: cartItem.quantity,
                        itemTotal
                    });
                }

                // 4. Calculate discount on the backend
                let discount = 0;
                let appliedCouponCode = null;

                if (couponCode) {
                    const couponResult = await couponService.applyCoupon(
                        couponCode,
                        subtotal
                    );

                    discount = couponResult.discount;
                    appliedCouponCode = couponResult.couponCode;
                }

                const total = Number(
                    (subtotal - discount).toFixed(2)
                );

                // 5. Decrement stock atomically for each product
                for (const item of orderItems) {
                    const stockUpdate = await Product.updateOne(
                        {
                            _id: item.product,
                            isActive: true,
                            stock: { $gte: item.quantity }
                        },
                        {
                            $inc: { stock: -item.quantity }
                        },
                        {
                            session: dbSession
                        }
                    );

                    if (stockUpdate.modifiedCount !== 1) {
                        const error = new Error(
                            `Stock changed during checkout for ${item.name}. Please try again.`
                        );
                        error.statusCode = 409;
                        throw error;
                    }
                }

                // 6. Generate an order number
                const orderNumber =
                    `SS-${Date.now()}-${new mongoose.Types.ObjectId()
                        .toString()
                        .slice(-6)
                        .toUpperCase()}`;

                // 7. Save the order
                const orders = await Order.create(
                    [
                        {
                            orderNumber,
                            sessionId,
                            items: orderItems,
                            subtotal,
                            discount,
                            couponCode: appliedCouponCode,
                            total,
                            status: "confirmed"
                        }
                    ],
                    {
                        session: dbSession
                    }
                );

                createdOrder = orders[0];

                // 8. Empty the cart after successful order creation
                cart.items = [];
                await cart.save({ session: dbSession });
            });

            return {
                orderNumber: createdOrder.orderNumber,
                status: createdOrder.status,
                items: createdOrder.items,
                subtotal: createdOrder.subtotal,
                discount: createdOrder.discount,
                couponCode: createdOrder.couponCode,
                total: createdOrder.total,
                createdAt: createdOrder.createdAt
            };
        } finally {
            await dbSession.endSession();
        }
    }
}

module.exports = new CheckoutService();
