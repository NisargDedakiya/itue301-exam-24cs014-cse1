const express = require("express");
const mongoose = require("mongoose");
const ClassBooking = require("../models/ClassBooking");
const Trainer = require("../models/Trainer");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

const VALID_TIME_SLOTS = [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "09:00 AM - 10:00 AM",
    "05:00 PM - 06:00 PM",
    "07:00 PM - 08:00 PM"
];

const VALID_STATUSES = ["booked", "attended", "cancelled"];

// Apply authGuard to all booking routes
router.use(authGuard);

// POST /api/v1/bookings - Create a new class booking (protected)
router.post("/", async (req, res, next) => {
    try {
        const { trainerId, className, date, timeSlot } = req.body;
        const memberId = req.member.id || req.member._id;
        const validationErrors = [];

        // 1. Validate trainerId
        if (!trainerId) {
            validationErrors.push("Trainer selection is required");
        } else if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            // Check if trainer exists by name as fallback or invalid id format
            const foundByName = await Trainer.findOne({ name: trainerId });
            if (!foundByName) {
                validationErrors.push("Invalid Trainer ID or Trainer not found");
            }
        }

        // 2. Validate className
        if (!className || className.trim().length < 2) {
            validationErrors.push("Class name is required and must contain at least 2 characters");
        }

        // 3. Validate date
        if (!date) {
            validationErrors.push("Booking date is required");
        } else {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                validationErrors.push("Invalid date format");
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (parsedDate < today) {
                    validationErrors.push("Booking date cannot be in the past");
                }
            }
        }

        // 4. Validate timeSlot
        if (!timeSlot || !VALID_TIME_SLOTS.includes(timeSlot)) {
            validationErrors.push(
                `Time slot is required and must be one of: ${VALID_TIME_SLOTS.join(", ")}`
            );
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        // Resolve trainerId if passed as name
        let resolvedTrainerId = trainerId;
        if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            const foundTrainer = await Trainer.findOne({ name: trainerId });
            if (foundTrainer) {
                resolvedTrainerId = foundTrainer._id;
            }
        }

        const newBooking = new ClassBooking({
            memberId,
            trainerId: resolvedTrainerId,
            className: className.trim(),
            date,
            timeSlot,
            status: "booked"
        });

        const savedBooking = await newBooking.save();
        const populatedBooking = await ClassBooking.findById(savedBooking._id)
            .populate("memberId", "name email")
            .populate("trainerId", "name specialization");

        res.status(201).json({
            success: true,
            message: "Class booked successfully",
            data: populatedBooking
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/bookings/my - Return logged-in member's bookings (protected)
router.get("/my", async (req, res, next) => {
    try {
        const memberId = req.member.id || req.member._id;

        const bookings = await ClassBooking.find({ memberId })
            .populate("memberId", "name email")
            .populate("trainerId", "name specialization")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/v1/bookings/:id/status - Update booking status (protected)
router.patch("/:id/status", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validationErrors = [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        if (!status) {
            validationErrors.push("Status field is required");
        } else if (!VALID_STATUSES.includes(status)) {
            validationErrors.push(`Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`);
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        const updatedBooking = await ClassBooking.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
            .populate("memberId", "name email")
            .populate("trainerId", "name specialization");

        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: updatedBooking
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/bookings - Return all bookings (for Admin / all overview)
router.get("/", async (req, res, next) => {
    try {
        const bookings = await ClassBooking.find()
            .populate("memberId", "name email phone membershipType")
            .populate("trainerId", "name specialization")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
