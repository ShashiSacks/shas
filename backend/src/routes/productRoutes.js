const express = require("express");

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const validateRequest = require("../middlewares/validateRequest");

const {
    createProductSchema,
    updateProductSchema
} = require("../validators/productValidator");

const router = express.Router();

// GET /api/products
// Retrieve all active products
router.get("/", getProducts);

// GET /api/products/:id
// Retrieve a single product
router.get("/:id", getProductById);

// POST /api/products
// Create a product after validating the request
router.post(
    "/",
    validateRequest(createProductSchema),
    createProduct
);

// PUT /api/products/:id
// Update a product after validating the request
router.put(
    "/:id",
    validateRequest(updateProductSchema),
    updateProduct
);

// DELETE /api/products/:id
// Delete a product
router.delete("/:id", deleteProduct);

module.exports = router;