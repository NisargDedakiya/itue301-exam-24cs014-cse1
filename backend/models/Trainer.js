const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Trainer name is required"],
            minlength: [2, "Trainer name must contain at least 2 characters"]
        },

        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            minlength: [2, "Specialization must contain at least 2 characters"]
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