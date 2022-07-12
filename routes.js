const { Router } = require("express");
const {
  uploadMiddleware,
  upload,
} = require("./src/controller/localUploadController");
const {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
} = require("./src/controller/youtubeUploadController");
const routes = Router();

// local upload
routes.post("/local-upload", uploadMiddleware, upload);

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

module.exports = routes;
