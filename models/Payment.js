const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: ["maintenance", "water", "electricity", "amenity", "penalty", "other"],
      required: [true, "Payment type is required"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "cash"],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    receipt: {
      url: String, // Cloudinary URL for receipt
      publicId: String,
    },
    month: {
      type: String, // Format: "YYYY-MM"
    },
    year: {
      type: Number,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ type: 1 })
paymentSchema.index({ month: 1, year: 1 })

module.exports = mongoose.model("Payment", paymentSchema)
