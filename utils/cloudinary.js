const cloudinary = require("cloudinary").v2
const multer = require("multer")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer configuration for memory storage
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only images and PDF files are allowed"), false)
    }
  },
})

// Upload to Cloudinary
const uploadToCloudinary = (buffer, folder = "society-app") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        },
      )
      .end(buffer)
  })
}

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
}
