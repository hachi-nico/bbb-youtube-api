const { Router } = require("express");
const multer = require("multer");
const path = require("path");

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
const { listenRecordingReady } = require("../controller/bbbWebhookController");

const uploadMiddleware = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const {
  recordingReadyMiddleware,
} = require("../middleware/callbackMiddleware");

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

  // invoke next middleware
  next();
};

// local upload
routes.post(
  "/local-upload",
  progressMiddleware,
  multer({ storage: storage }).single("file"),
  upload
);

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
routes.post(
  "/callback-recording-ready",
  recordingReadyMiddleware,
  listenRecordingReady
);

// redirect uri oauth
routes.get("/google-oauth-redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

// heavy call test
// routes.get("/api/:n", function (req, res) {
//   let n = parseInt(req.params.n);
//   let count = 0;

//   if (n > 5000000000) n = 5000000000;

//   for (let i = 0; i <= n; i++) {
//     count += i;
//   }

//   res.send(`Final count is ${count}`);
// });

module.exports = routes;
