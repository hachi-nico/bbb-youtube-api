const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

const { upload } = require("../controller/localUploadController");
const {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
} = require("../controller/youtubeUploadController");
const { login, logout } = require("../controller/authController");
const {
  actionUserList,
  actionAddUser,
  actionUpdateUser,
  actionDeleteUser,
} = require("../controller/userController");
const { listenRecordingReady } = require("../controller/bbbCallbackController");
const { actionGetAntrian } = require("../controller/laporanUploadController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  apiCall,
  BASE_BBB,
  hashBBBSecret,
} = require("../controller/globalFunction");

const routes = Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const progressMiddleware = (req, res, next) => {
  let progress = 0;
  const file_size = req.headers["content-length"];

  req.on("data", (chunk) => {
    progress += chunk.length;
    const percentage = (progress / file_size) * 100;
  });

  next();
};

// local upload
routes.post(
  "/local-upload",
  progressMiddleware,
  multer({ storage: storage }).single("file"),
  upload
);

// laporan
routes.post("/antrian", authMiddleware, actionGetAntrian);

// google auth dan callback youtube
routes.post("/get-auth-callback", getAuthWithCallback);
routes.get("/get-auth-url", getAuthUrl);
routes.post("/get-new-token", getNewToken);

// auth
routes.post("/login", login);
routes.post("/logout", logout);

// user
routes.post("/user-list", authMiddleware, actionUserList);
routes.post("/add-user", authMiddleware, actionAddUser);
routes.post("/update-user", authMiddleware, actionUpdateUser);
routes.post("/delete-user", authMiddleware, actionDeleteUser);

// callback
routes.post("/callback-recording-ready", listenRecordingReady);

// redirect uri oauth
routes.get("/google-oauth-redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

routes.post("/testing", async (req, res) => {
  console.log('callback hit !!!');
  let bbbCallbackBody = "";
  if (req.body.signed_parameters)
    bbbCallbackBody = jwt.decode(req.body.signed_parameters);

  console.log(bbbCallbackBody, "callback body");
  return res.status(200).json({});
});

module.exports = routes;
