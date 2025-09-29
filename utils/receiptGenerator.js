const { uploadToCloudinary } = require("./cloudinary")

// Generate PDF receipt (you can use libraries like puppeteer, jsPDF, or PDFKit)
const generateReceipt = async (payment) => {
  try {
    // For now, we'll create a simple HTML receipt and convert to PDF
    // In production, you might want to use a proper PDF library

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Society Management App</h1>
          <h2>Payment Receipt</h2>
        </div>
        
        <div class="details">
          <div class="row">
            <span><strong>Receipt No:</strong></span>
            <span>${payment._id}</span>
          </div>
          <div class="row">
            <span><strong>Date:</strong></span>
            <span>${payment.paidDate ? payment.paidDate.toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span><strong>Name:</strong></span>
            <span>${payment.user.name}</span>
          </div>
          <div class="row">
            <span><strong>Flat:</strong></span>
            <span>${payment.user.flatNumber}${payment.user.wing ? `, Wing ${payment.user.wing}` : ""}</span>
          </div>
          <div class="row">
            <span><strong>Payment Type:</strong></span>
            <span>${payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}</span>
          </div>
          ${
            payment.description
              ? `
          <div class="row">
            <span><strong>Description:</strong></span>
            <span>${payment.description}</span>
          </div>
          `
              : ""
          }
          <div class="row">
            <span><strong>Payment Method:</strong></span>
            <span>${payment.paymentMethod ? payment.paymentMethod.toUpperCase() : "Online"}</span>
          </div>
          <div class="row">
            <span><strong>Transaction ID:</strong></span>
            <span>${payment.transactionId}</span>
          </div>
          <div class="row">
            <span><strong>Amount Paid:</strong></span>
            <span class="amount">₹${payment.amount}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>This is a computer generated receipt and does not require signature.</p>
          <p>For any queries, please contact the society management.</p>
        </div>
      </body>
      </html>
    `

    // Convert HTML to PDF (you would use a library like puppeteer here)
    // For now, we'll simulate by creating a text file
    const receiptBuffer = Buffer.from(receiptHTML, "utf8")

    // Upload to Cloudinary
    const result = await uploadToCloudinary(receiptBuffer, "receipts")

    return result
  } catch (error) {
    console.error("Receipt generation failed:", error)
    throw new Error("Failed to generate receipt")
  }
}

// Generate payment summary report
const generatePaymentReport = async (payments, filters) => {
  try {
    let reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #e9ecef; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Society Management App</h1>
          <h2>Payment Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Flat</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
    `

    let totalAmount = 0

    for (const payment of payments) {
      if (payment.status === "completed") {
        totalAmount += payment.amount
      }

      reportHTML += `
        <tr>
          <td>${payment.paidDate ? payment.paidDate.toLocaleDateString() : payment.createdAt.toLocaleDateString()}</td>
          <td>${payment.user.name}</td>
          <td>${payment.user.flatNumber}${payment.user.wing ? `, ${payment.user.wing}` : ""}</td>
          <td>${payment.type}</td>
          <td>₹${payment.amount}</td>
          <td>${payment.status}</td>
          <td>${payment.paymentMethod || "Online"}</td>
        </tr>
      `
    }

    reportHTML += `
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4"><strong>Total Collected:</strong></td>
              <td><strong>₹${totalAmount}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `

    const reportBuffer = Buffer.from(reportHTML, "utf8")
    const result = await uploadToCloudinary(reportBuffer, "reports")

    return result
  } catch (error) {
    console.error("Report generation failed:", error)
    throw new Error("Failed to generate report")
  }
}

module.exports = {
  generateReceipt,
  generatePaymentReport,
}
