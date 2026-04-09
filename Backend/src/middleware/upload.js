const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "Messato_images",

    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,

    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],

    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only images & PDFs allowed"), false);
    }

    cb(null, true);
  }
});

module.exports = upload;