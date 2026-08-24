const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Trainer name is required"],
            trim: true,
            minlength: [2, "Trainer name must contain at least 2 characters"],
            maxlength: [60, "Trainer name cannot exceed 60 characters"]
        },

        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            trim: true,
            minlength: [2, "Specialization must contain at least 2 characters"],
            maxlength: [100, "Specialization cannot exceed 100 characters"]
        },

        available: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Trainer", trainerSchema);