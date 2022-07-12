const multer = require("multer");
const path = require("path");

// controller
const upload = (req, res) => {
  try {
    return res.status(200).json({
      message: "Berhasil upload ke server",
      req: req.body,
    });
  } catch (e) {
    return res.status(500).json({ e, message: "Error saat upload ke server" });
  }
};

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

module.exports = { upload, uploadMiddleware };
