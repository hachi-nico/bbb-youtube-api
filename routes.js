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
routes.post("/local-upload", multerUpload.single("file"), upload);

// google auth dan callback youtube
routes.get("/get-auth-callback", getAuthWithCallback);
routes.get("/get-auth-url", getAuthUrl);
routes.post("/get-new-token", getNewToken);

// redirect uri oauth
routes.get("/google-oauth-redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

// // test routes
// routes.get("/", (req, res) => {
//   return res.status(200).json({
//     message:
//       process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
//   });
// });

module.exports = routes;
