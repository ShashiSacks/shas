require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");

// Route imports
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const authRoutes = require("./routes/authRoutes"); // NEW

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ShopSmart API is running!"
    });
});

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
});

// Product routes
app.use("/api/products", productRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Checkout routes
app.use("/api/checkout", checkoutRoutes);

// Authentication routes - NEW
app.use("/api/auth", authRoutes);

// Error-handling middleware (must be last)
app.use(errorMiddleware);

// Server configuration
const PORT = process.env.PORT || 8000;

// Start the server only after MongoDB connects
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`ShopSmart server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();