const { body, validationResult } = require("express-validator")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User registration validation
const validateUserRegistration = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("phone").isMobilePhone("en-IN").withMessage("Please provide a valid Indian phone number"),
  body("flatNumber").trim().isLength({ min: 1, max: 10 }).withMessage("Flat number is required"),
  body("wing").optional().trim().isLength({ max: 5 }).withMessage("Wing must be maximum 5 characters"),
  handleValidationErrors,
]

// User login validation
const validateUserLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validatePayment = [
  body("amount").isFloat({ min: 1 }).withMessage("Amount must be greater than 0"),
  body("type").isIn(["maintenance", "water", "electricity", "amenity", "penalty"]).withMessage("Invalid payment type"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description must be maximum 200 characters"),
  handleValidationErrors,
]


module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePayment,
  handleValidationErrors,
}
