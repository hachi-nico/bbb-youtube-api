const { Router } = require("express");
const { upload } = require("./src/controller/localUploadController");
const { getAuth } = require("./src/controller/youtubeUploadController");
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

// youtube routes
routes.post("/v1/youtube/upload", multerUpload.single("file"), upload);

// google routes
routes.get("/v1/google/get-auth", getAuth);
routes.get("/v1/google/redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

// test routes
routes.get("/", (req, res) => {
  return res.status(200).json({
    message:
      process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
  });
});

module.exports = routes;
