const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
routes.post("/callback-recording-ready", listenRecordingReady);

// redirect uri oauth
routes.get("/google-oauth-redirect-uri", (req, res) => {
  return res.status(200).json({
    message: "This is redirect uris",
  });
});

routes.post("/testing", async (req, res) => {
  // const secret = hashBBBSecret(process.env.BBB_SECRET);
  // const data = await apiCall(
  //   BASE_BBB +
  //     'api/create?allowStartStopRecording=true&attendeePW=ap&autoStartRecording=false&meetingID=random-2228532&meta_bbb-recording-ready-url=https%253A%252F%252Fconference16.ethol.pens.ac.id%252Fbbbytapi%252Fcallback-recording-ready&moderatorPW=mp&name=random-2228532&record=true&voiceBridge=77237&welcome=%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21&checksum=a661e4a2f0635793fb037f0c4d637892f285f40a'
  // );
  // const recording = fs.readFileSync("/var/www/note.txt", "utf8");
  // return res.json({ recording });
  return res.download(
    "/var/bigbluebutton/published/presentation/f00e0b5fe0a9e7d59080714ed66c50d54a05cabe-1666858268162/video/webcams.webm"
  );
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
