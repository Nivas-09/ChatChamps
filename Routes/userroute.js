const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodels");
require("dotenv").config();

const router = express.Router();

// ✅ User Signup
router.post("/signup", async (req, res) => {
    const { name, surname, email, password } = req.body;

    try {
        // Email validation using regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[cC][oO][mM]$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format. Must end with .com" });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists. Please login." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({ name, surname, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Ensure JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in environment variables");
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
const authMiddleware = require("../Middleware/authmiddleware"); // Import middleware

// ✅ Protected Route
router.get("/protected", authMiddleware, (req, res) => {
    res.json({ success: true, message: "Access granted!", user: req.user });
});

 

module.exports = router;
