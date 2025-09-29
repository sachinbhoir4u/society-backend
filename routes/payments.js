const express = require("express")
const Payment = require("../models/Payment")
const User = require("../models/User")
const { protect, committee } = require("../middleware/auth")
const { validatePayment } = require("../middleware/validation")
const { createRazorpayOrder, verifyRazorpayPayment } = require("../utils/razorpay")
const { generateReceipt } = require("../utils/receiptGenerator")
const { sendEmail } = require("../utils/sendEmail")

const router = express.Router()

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status || ""
    const type = req.query.type || ""
    const month = req.query.month || ""
    const year = req.query.year || ""

    const query = {}

    // Regular users can only see their own payments
    if (req.user.role === "resident") {
      query.user = req.user.id
    }

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    if (month) {
      query.month = month
    }

    if (year) {
      query.year = Number.parseInt(year)
    }

    const payments = await Payment.find(query)
      .populate("user", "name flatNumber wing email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Payment.countDocuments(query)

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get payments error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user", "name flatNumber wing email phone")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Check access rights
    if (req.user.role === "resident" && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this payment",
      })
    }

    res.json({
      success: true,
      data: { payment },
    })
  } catch (error) {
    console.error("Get payment error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

// @desc    Create payment order (Razorpay)
// @route   POST /api/payments/create-order
// @access  Private
router.post("/create-order", protect, validatePayment, async (req, res) => {
  try {
    const { amount, type, description, dueDate, month, year } = req.body

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      amount,
      type,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      month,
      year,
      status: "pending",
    })

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount, payment._id.toString())

    // Update payment with Razorpay order ID
    payment.razorpayOrderId = razorpayOrder.id
    await payment.save()

    res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: {
        payment: {
          id: payment._id,
          amount: payment.amount,
          type: payment.type,
          description: payment.description,
        },
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      },
    })
  } catch (error) {
    console.error("Create payment order error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify-razorpay
// @access  Private
router.post("/verify-razorpay", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Find payment by Razorpay order ID
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id }).populate(
      "user",
      "name email flatNumber wing",
    )

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Verify payment signature
    const isValid = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValid) {
      payment.status = "failed"
      await payment.save()

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    // Update payment status
    payment.status = "completed"
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature
    payment.paidDate = new Date()
    payment.paymentMethod = "upi" // Default, can be updated based on actual method
    payment.transactionId = razorpay_payment_id

    await payment.save()

    // Generate receipt
    try {
      const receiptUrl = await generateReceipt(payment)
      payment.receipt = {
        url: receiptUrl.secure_url,
        publicId: receiptUrl.public_id,
      }
      await payment.save()
    } catch (receiptError) {
      console.error("Receipt generation failed:", receiptError)
      // Don't fail the payment if receipt generation fails
    }

    // Send confirmation email
    try {
      await sendEmail({
        email: payment.user.email,
        subject: "Payment Confirmation - Society App",
        html: `
          <h2>Payment Successful</h2>
          <p>Dear ${payment.user.name},</p>
          <p>Your payment has been successfully processed.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details:</h3>
            <p><strong>Amount:</strong> ₹${payment.amount}</p>
            <p><strong>Type:</strong> ${payment.type}</p>
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
            <p><strong>Date:</strong> ${payment.paidDate.toLocaleDateString()}</p>
            ${payment.description ? `<p><strong>Description:</strong> ${payment.description}</p>` : ""}
          </div>
          <p>Thank you for your payment!</p>
          <p>Best regards,<br>Society Management Team</p>
        `,
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the payment if email fails
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: { payment },
    })
  } catch (error) {
    console.error("Verify Razorpay payment error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

// @desc    Download payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
router.get("/:id/receipt", protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user", "name flatNumber wing email phone")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Check access rights
    if (req.user.role === "resident" && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this receipt",
      })
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Receipt not available for incomplete payments",
      })
    }

    // Generate receipt if not exists
    if (!payment.receipt || !payment.receipt.url) {
      try {
        const receiptUrl = await generateReceipt(payment)
        payment.receipt = {
          url: receiptUrl.secure_url,
          publicId: receiptUrl.public_id,
        }
        await payment.save()
      } catch (receiptError) {
        console.error("Receipt generation failed:", receiptError)
        return res.status(500).json({
          success: false,
          message: "Failed to generate receipt",
        })
      }
    }

    res.json({
      success: true,
      data: {
        receiptUrl: payment.receipt.url,
      },
    })
  } catch (error) {
    console.error("Download receipt error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
})

module.exports = router
