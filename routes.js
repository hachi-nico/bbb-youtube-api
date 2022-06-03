const { Router } = require("express");
const { upload } = require("./src/controller/localUploadController");
const {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
} = require("./src/controller/youtubeUploadController");
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

// local upload
routes.post("/v1/youtube/upload", multerUpload.single("file"), upload);

// google auth dan callback youtube
routes.get("/v1/google/get-auth", getAuthWithCallback);
routes.post("/v1/google/get-auth-url", getAuthUrl);
routes.post("/v1/google/get-new-token", getNewToken);
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
