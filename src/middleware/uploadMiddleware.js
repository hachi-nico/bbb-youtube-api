const multer = require("multer");
const path = require("path");

// override engine multer untuk tambah extension file
const uploadMiddleware = async () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const multerUpload = multer({ storage: storage });

  multerUpload.single("file");
};

module.exports = uploadMiddleware;
