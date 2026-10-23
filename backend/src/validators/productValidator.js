const { z } = require("zod");

// Schema for creating a product
const createProductSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Product name must contain at least 2 characters"),

        description: z
            .string()
            .trim()
            .min(5, "Description must contain at least 5 characters"),

        price: z
            .number()
            .positive("Price must be greater than zero"),

        image: z
            .string()
            .optional()
            .default(""),

        category: z
            .string()
            .trim()
            .min(2, "Category must contain at least 2 characters"),

        stock: z
            .number()
            .int("Stock must be a whole number")
            .min(0, "Stock cannot be negative")
            .default(0),

        isActive: z
            .boolean()
            .optional()
            .default(true)
    })
});

// Schema for updating a product
const updateProductSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).optional(),
        description: z.string().trim().min(5).optional(),
        price: z.number().positive().optional(),
        image: z.string().optional(),
        category: z.string().trim().min(2).optional(),
        stock: z.number().int().min(0).optional(),
        isActive: z.boolean().optional()
    }).strict().refine(
        (data) => Object.keys(data).length > 0,
        "Provide at least one field to update"
    )
});

module.exports = {
    createProductSchema,
    updateProductSchema
};