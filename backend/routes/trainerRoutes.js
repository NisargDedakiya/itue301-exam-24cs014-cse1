const express = require("express");
const Trainer = require("../models/Trainer");

const router = express.Router();

// GET /api/v1/trainers - Return all trainers (public)
router.get("/", async (req, res, next) => {
    try {
        let trainers = await Trainer.find().sort({ createdAt: -1 });

        // Auto-seed sample trainers if collection is empty
        if (trainers.length === 0) {
            const defaultTrainers = [
                {
                    name: "Rahul Patel",
                    specialization: "Strength Training",
                    available: true
                },
                {
                    name: "Priya Shah",
                    specialization: "Yoga & Flexibility",
                    available: false
                },
                {
                    name: "Amit Sharma",
                    specialization: "Cardio & HIIT",
                    available: true
                },
                {
                    name: "Sneha Mehta",
                    specialization: "Pilates & Core",
                    available: true
                },
                {
                    name: "Vikram Singh",
                    specialization: "CrossFit & Conditioning",
                    available: false
                }
            ];
            trainers = await Trainer.insertMany(defaultTrainers);
        }

        res.status(200).json({
            success: true,
            count: trainers.length,
            data: trainers
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/trainers - Create a new trainer with validation
router.post("/", async (req, res, next) => {
    try {
        const { name, specialization, available } = req.body;
        const validationErrors = [];

        if (!name || name.trim().length < 2) {
            validationErrors.push("Trainer name is required and must contain at least 2 characters");
        }

        if (!specialization || specialization.trim().length < 2) {
            validationErrors.push("Specialization is required and must contain at least 2 characters");
        }

        if (available !== undefined && typeof available !== "boolean") {
            validationErrors.push("Available must be a boolean value (true or false)");
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        const trainer = new Trainer({
            name: name.trim(),
            specialization: specialization.trim(),
            available: available !== undefined ? available : true
        });
        await trainer.save();

        res.status(201).json({
            success: true,
            message: "Trainer created successfully",
            data: trainer
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
