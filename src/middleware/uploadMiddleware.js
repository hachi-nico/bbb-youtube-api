const multer = require("multer");
const path = require("path");

// override engine multer untuk tambah extension file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

module.exports = (req, res, next) => {
  let progress = 0;
  const file_size = req.headers["content-length"];

  req.on("data", (chunk) => {
    progress += chunk.length;
    const percentage = (progress / file_size) * 100;
    console.log(percentage);
  });
  return multer({ storage: storage }).single("file")(req, res, () => {
    next();
  });
};
