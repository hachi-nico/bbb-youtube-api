const { Router } = require("express");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");

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
const {
  actionGetAntrian,
  actionCountAntrian,
} = require("../controller/laporanUploadController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const {
  apiCall,
  BASE_BBB,
  hashBBBSecret,
} = require("../controller/globalFunction");

const routes = Router();

// local upload
routes.post("/local-upload", uploadMiddleware, upload);

// laporan
routes.post("/antrian", authMiddleware, actionGetAntrian);
routes.post("/count-antrian", authMiddleware, actionCountAntrian);

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

// notification
webpush.setVapidDetails(
  "mailto:test@test.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

let globalSubscription = "";
routes.post("/notification-subscribe", (req, res) => {
  const subscription = req.body;
  globalSubscription = subscription;
  res.status(200).json({});
});

routes.post("/testing", async (req, res) => {
  const payload = JSON.stringify({
    title: "Hello World",
    body: "This is your first push notification",
  });

  webpush
    .sendNotification(globalSubscription, payload)
    .catch((e) => console.log(e));
  return res.status(200).json({});
});

module.exports = { routes, globalSubscription };
