const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register a new user
// Register a new user
router.post("/register", async (req, res) => {
    try {
        let { name, email, password, location } = req.body;

        // Clean input
        name = name?.trim();
        email = email?.trim().toLowerCase();
        location = location?.trim();

        const errors = [];

        // Required fields
        if (!name) {
            errors.push("Full name is required.");
        }

        if (!email) {
            errors.push("Email address is required.");
        }

        if (!password) {
            errors.push("Password is required.");
        }

        if (!location) {
            errors.push("Location is required.");
        }

        // Name validation
        if (name && (name.length < 2 || name.length > 50)) {
            errors.push(
                "Name must be between 2 and 50 characters."
            );
        }

        // Email validation
if (email) {

    const emailParts = email.split("@");

    const isValidEmail =
        emailParts.length === 2 &&
        emailParts[0].length >= 1 &&
        emailParts[1].includes(".") &&
        emailParts[1].split(".").every(part => part.length >= 2) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        errors.push(
            "Please enter a valid email address."
        );
    }
}
        // Password validation
        if (password && password.length < 6) {
            errors.push(
                "Password must contain at least 6 characters."
            );
        }

        // Location validation
        if (
            location &&
            (location.length < 2 || location.length > 100)
        ) {
            errors.push(
                "Location must be between 2 and 100 characters."
            );
        }

        // Return all validation errors together
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please correct the following:",
                errors
            });
        }

        // Check if email already exists
        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            location
        });

        // Safe response without password
        res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                location: newUser.location,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(
            "Registration error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error during registration."
        });
    }
});
/// Login user
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Clean input
        email = email?.trim().toLowerCase();

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password."
            });
        }

        // Validate email format
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Find user
        const user =
            await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Login successful
        res.status(200).json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                role: user.role
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
});
module.exports = router;