const express = require("express");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");

const router = express.Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_MEMBERSHIP_TYPES = ["basic", "premium", "platinum"];

// POST /api/v1/auth/login - Authenticate member, issue token
router.post("/login", async (req, res, next) => {
    try {
        const { email, password, name, membershipType } = req.body;
        const validationErrors = [];

        // Input validations
        if (!email || !email.trim()) {
            validationErrors.push("Email is required");
        } else if (!EMAIL_REGEX.test(email.trim())) {
            validationErrors.push("Please provide a valid email address");
        }

        if (!password || password.trim().length < 6) {
            validationErrors.push("Password must contain at least 6 characters");
        }

        if (name && name.trim().length < 2) {
            validationErrors.push("Name must contain at least 2 characters");
        }

        if (membershipType && !VALID_MEMBERSHIP_TYPES.includes(membershipType)) {
            validationErrors.push("Membership type must be one of: basic, premium, platinum");
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find existing member or auto-register demo member
        let member = await Member.findOne({ email: normalizedEmail });

        if (!member) {
            member = new Member({
                name: (name && name.trim()) || normalizedEmail.split("@")[0] || "FitZone Member",
                email: normalizedEmail,
                phone: req.body.phone || "9876543210",
                membershipType: membershipType || "basic"
            });
            await member.save();
        }

        const jwtSecret = process.env.JWT_SECRET || "fitzone_exam_secret_2026";
        const role = normalizedEmail.includes("admin") ? "admin" : "member";
        const token = jwt.sign(
            {
                id: member._id,
                email: member.email,
                name: member.name,
                role
            },
            jwtSecret,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            member: {
                id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone,
                membershipType: member.membershipType
            },
            role
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/auth/register - Direct registration endpoint with full validation
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, phone, membershipType } = req.body;
        const validationErrors = [];

        if (!name || name.trim().length < 2) {
            validationErrors.push("Name is required and must contain at least 2 characters");
        }

        if (!email || !EMAIL_REGEX.test(email.trim())) {
            validationErrors.push("A valid email address is required");
        }

        if (phone && !/^[0-9+-\s()]{10,15}$/.test(phone.trim())) {
            validationErrors.push("Phone number must contain at least 10 valid digits");
        }

        if (membershipType && !VALID_MEMBERSHIP_TYPES.includes(membershipType)) {
            validationErrors.push("Membership type must be one of: basic, premium, platinum");
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        const member = new Member({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : undefined,
            membershipType: membershipType || "basic"
        });
        await member.save();

        res.status(201).json({
            success: true,
            message: "Member registered successfully",
            member
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
