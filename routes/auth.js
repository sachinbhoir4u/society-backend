const express = require("express");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/auth");
const { validateUserRegistration, validateUserLogin } = require("../middleware/validation")

const router = express.Router();

// @route   POST /api/auth/register
// @access  Public
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, phone, flatNumber, wing, floor } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Check if flat number is already taken
    const existingFlat = await User.findOne({ flatNumber, wing })
    if (existingFlat) {
      return res.status(400).json({
        success: false,
        message: "This flat is already registered",
      })
    }


    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      flatNumber,
      wing,
      floor
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for verification.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          flatNumber: user.flatNumber,
          wing: user.wing,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token: generateToken(user._id),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    })
  }
})

// @route   POST /api/auth/login
// @access  Public
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for user and include password
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          flatNumber: user.flatNumber,
          wing: user.wing,
          floor: user.floor,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
        },
        token: generateToken(user._id),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    })
  }
})

// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can track logout time for analytics
    const user = await User.findById(req.user.id)
    user.lastLogin = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

module.exports = router
