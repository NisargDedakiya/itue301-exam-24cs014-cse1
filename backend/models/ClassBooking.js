const mongoose = require("mongoose");

const classBookingSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: [true, "Member ID is required"]
        },

        trainerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trainer",
            required: [true, "Trainer ID is required"]
        },

        className: {
            type: String,
            required: [true, "Class name is required"],
            trim: true,
            minlength: [2, "Class name must contain at least 2 characters"],
            maxlength: [80, "Class name cannot exceed 80 characters"]
        },

        date: {
            type: Date,
            required: [true, "Booking date is required"],
            validate: {
                validator: function (v) {
                    if (!v) return false;
                    const bookingDate = new Date(v);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return bookingDate >= today;
                },
                message: "Booking date cannot be in the past"
            }
        },

        timeSlot: {
            type: String,
            required: [true, "Time slot is required"],
            trim: true,
            enum: {
                values: [
                    "06:00 AM - 07:00 AM",
                    "07:00 AM - 08:00 AM",
                    "09:00 AM - 10:00 AM",
                    "05:00 PM - 06:00 PM",
                    "07:00 PM - 08:00 PM"
                ],
                message: "Invalid time slot selected"
            }
        },

        status: {
            type: String,
            enum: {
                values: ["booked", "attended", "cancelled"],
                message: "Status must be one of: booked, attended, cancelled"
            },
            default: "booked"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ClassBooking", classBookingSchema);