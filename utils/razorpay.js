const Razorpay = require("razorpay")
const crypto = require("crypto")

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Razorpay order
const createRazorpayOrder = async (amount, receipt) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: receipt,
      payment_capture: 1, // Auto capture payment
    }

    const order = await razorpay.orders.create(options)
    return order
  } catch (error) {
    console.error("Razorpay order creation failed:", error)
    throw new Error("Failed to create payment order")
  }
}

// Verify Razorpay payment signature
const verifyRazorpayPayment = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    return expectedSignature === signature
  } catch (error) {
    console.error("Razorpay signature verification failed:", error)
    return false
  }
}

// Get payment details from Razorpay
const getRazorpayPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error("Failed to fetch Razorpay payment:", error)
    throw new Error("Failed to fetch payment details")
  }
}

// Refund Razorpay payment
const refundRazorpayPayment = async (paymentId, amount = null) => {
  try {
    const refundOptions = {
      payment_id: paymentId,
    }

    if (amount) {
      refundOptions.amount = amount * 100 // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions)
    return refund
  } catch (error) {
    console.error("Razorpay refund failed:", error)
    throw new Error("Failed to process refund")
  }
}

// Create Razorpay customer
const createRazorpayCustomer = async (name, email, contact) => {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact,
    })
    return customer
  } catch (error) {
    console.error("Razorpay customer creation failed:", error)
    throw new Error("Failed to create customer")
  }
}

module.exports = {
  razorpay,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayPayment,
  refundRazorpayPayment,
  createRazorpayCustomer,
}
