const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const requestLogger = require("./middleware/requestLogger");

const authRoutes = require("./routes/authRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// Global request logger
app.use(requestLogger);


// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/trainers", trainerRoutes);
app.use("/api/v1/bookings", bookingRoutes);


// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FitZone API is running"
    });
});


// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
            error => error.message
        );

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: messages
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });