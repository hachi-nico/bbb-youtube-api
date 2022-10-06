const { Router } = require("express");
const { upload } = require("../controller/localUploadController");
const {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
} = require("../controller/youtubeUploadController");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { login, createUser, logout } = require("../controller/authController");
const routes = Router();

// local upload
routes.post("/local-upload", uploadMiddleware, upload);

// google auth dan callback youtube
routes.post("/get-auth-callback", getAuthWithCallback);
routes.get("/get-auth-url", getAuthUrl);
routes.post("/get-new-token", getNewToken);

// auth
routes.post("/login", login);
routes.post("/create-user", createUser);
routes.post("/logout", logout);

// testing routes
routes.post("/testing", authMiddleware, (req, res) => {
  return res.send("success");
});

// redirect uri oauth
routes.get("/google-oauth-redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

module.exports = routes;
