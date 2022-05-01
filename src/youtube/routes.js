const { Router } = require("express");
const { upload } = require("./controller");
const multer = require("multer");
const path = require("path");
const routes = Router();

// override engine multer untuk tambah extension file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const multerUpload = multer({ storage: storage });

routes.post("/v1/youtube/upload", multerUpload.single("file"), upload);

module.exports = routes;
