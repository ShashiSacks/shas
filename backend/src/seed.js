require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");

// Sample products with images
const products = [
    {
        name: "Wireless Headphones",
        description: "Wireless headphones with clear sound and comfortable ear cushions.",
        price: 1499,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        stock: 25,
        isActive: true
    },
    {
        name: "Smart Watch",
        description: "Smart watch with fitness tracking and notifications.",
        price: 2499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Electronics",
        stock: 15,
        isActive: true
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with powerful sound.",
        price: 999,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        category: "Electronics",
        stock: 30,
        isActive: true
    },
    {
        name: "Laptop Backpack",
        description: "Durable backpack with a padded laptop compartment.",
        price: 799,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Accessories",
        stock: 20,
        isActive: true
    },
    {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse for everyday computing.",
        price: 599,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        category: "Accessories",
        stock: 40,
        isActive: true
    }
];

// Sample coupon
const coupons = [
    {
        code: "SAVE10",
        description: "Get 10% off your order.",
        discountType: "percentage",
        discountValue: 10,
        minimumOrderValue: 500,
        maximumDiscount: 200,
        expiryDate: new Date("2027-12-31T23:59:59.999Z"),
        isActive: true
    }
];

// Seed the database
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Insert or update sample products
        for (const productData of products) {
            await Product.updateOne(
                { name: productData.name },
                { $set: productData },
                {
                    upsert: true,
                    runValidators: true
                }
            );
        }

        // Insert or update the coupon
        for (const couponData of coupons) {
            await Coupon.updateOne(
                { code: couponData.code },
                { $set: couponData },
                {
                    upsert: true,
                    runValidators: true
                }
            );
        }

        console.log("Sample products seeded successfully.");
        console.log("Product images updated successfully.");
        console.log("SAVE10 coupon seeded successfully.");

    } catch (error) {
        console.error("Database seeding failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();