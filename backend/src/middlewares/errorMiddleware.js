function errorMiddleware(err, req, res, next) {
    console.error(err.stack || err.message);

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Duplicate MongoDB fields
    if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this value already exists";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
}

module.exports = errorMiddleware;