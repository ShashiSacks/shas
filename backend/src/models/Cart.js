const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be a whole number"
            }
        }
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        // Temporary session identifier; authentication can be added later.
        sessionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        items: {
            type: [cartItemSchema],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);