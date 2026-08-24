const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please provide a valid email address"
            ]
        },

        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    // Optional, but if provided, must be at least 10 digits
                    return !v || /^[0-9+-\s()]{10,15}$/.test(v);
                },
                message: "Phone number must be at least 10 valid digits"
            }
        },

        membershipType: {
            type: String,
            enum: {
                values: ["basic", "premium", "platinum"],
                message: "Membership type must be one of: basic, premium, platinum"
            },
            default: "basic"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Member", memberSchema);