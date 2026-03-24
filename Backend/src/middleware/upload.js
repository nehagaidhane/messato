const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "Messato_images",

      // ✅ unique filename
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,

      // ✅ allowed formats
      allowed_formats: ["jpg", "png", "jpeg", "webp"],

      // ✅ optional optimization
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  },
});

const upload = multer({
  storage,

  // ✅ 20MB limit
  limits: { fileSize: 20 * 1024 * 1024 },

  // ✅ file validation
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("❌ Only image files allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;