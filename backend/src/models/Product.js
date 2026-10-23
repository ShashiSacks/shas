const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            trim: true,
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Stock cannot be negative"],
            validate: {
                validator: Number.isInteger,
                message: "Stock must be a whole number",
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);