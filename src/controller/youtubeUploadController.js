const fs = require("fs");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// jika mengubah scopes hapus dulu json yang tersimpan
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
];
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "mytoken.json";

const getAuth = (req, res) => {
  const { callbackTypes } = req.query;
  try {
    // Load dari file lokal
    fs.readFile(
      "client-secret-dev.json",
      function processClientSecrets(err, content) {
        if (err) {
          return res.status(500).json({
            message: "Gagal saat load client secret file: " + err,
          });
        }
        if (callbackTypes == "getChannel") {
          authorize(JSON.parse(content), getChannel, res);
        } else if (callbackTypes == "youtubeUpload") {
          authorize(JSON.parse(content), youtubeUpload, res);
        }
      }
    );
  } catch (e) {
    return res.status(500).json({
      message: "Gagal get auth " + e,
    });
  }
};

// proses auth
const authorize = (credentials, callback, res) => {
  const { client_secret, client_id } = credentials.web;
  const redirectUrl = credentials.web.redirect_uris[0];

  // Cek apakah sudah ada token yang tersimpan di disk sebelumnya
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      // jika belum return credentialnya saja
      return res.status(200).json({
        status: 0,
        message: "Token yang tersimpan tidak ditemukan",
        oauth2ClientSecret: client_secret,
        oauth2ClientId: client_id,
        oauth2ClientRedirectUrl: redirectUrl,
      });
    } else {
      const oauth2Client = new OAuth2(client_id, client_secret, redirectUrl);
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, res);
    }
  });
};

const getAuthUrl = (req, res) => {
  const { oauth2ClientSecret, oauth2ClientId, oauth2ClientRedirectUrl } =
    req.body;

  const oauth2Client = new OAuth2(
    oauth2ClientId,
    oauth2ClientSecret,
    oauth2ClientRedirectUrl
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  return res.json({ authUrl });
  // return res.redirect(authUrl);
};

const getNewToken = (req, res) => {
  const { oauth2ClientSecret, oauth2ClientId, oauth2ClientRedirectUrl, code } =
    req.body;

  const oauth2Client = new OAuth2(
    oauth2ClientId,
    oauth2ClientSecret,
    oauth2ClientRedirectUrl
  );

  oauth2Client.getToken(code, function (err, token) {
    if (err) {
      return res.status(500).json({
        message: "Gagal saat mendapatkan token dari authurl" + err,
      });
    }
    oauth2Client.credentials = token;
    storeToken(token);
    getChannel(oauth2Client, res);
  });
};

const storeToken = (token) => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token tersimpan ke " + TOKEN_PATH);
  });
};

const getChannel = (auth, res) => {
  const service = google.youtube("v3");
  service.channels.list(
    {
      mine: true,
      auth: auth,
      part: "snippet,contentDetails,statistics",
    },
    function (err, response) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      const channels = response.data.items;
      if (channels.length == 0) {
        console.log("No channel found.");
      } else {
        console.log(
          "This channel's ID is %s. Its title is '%s', and " +
            "it has %s views.",
          channels[0].id,
          channels[0].snippet.title,
          channels[0].statistics.viewCount
        );
        return res.status(200).json({
          auth,
          message: "berhasil get channel " + channels[0].snippet.title,
        });
      }
    }
  );
};

const returnAtuh = (auth, res) => {
  return res.status(200).json({
    authObject: auth,
  });
};

const youtubeUpload = (auth, res, fileAttributes) => {
  try {
    // const { path } = fileAttributes;
    const youtube = google.youtube({ version: "v3", auth });
    console.log(youtube);
    youtube.videos.insert(
      {
        resource: {
          // Video title and description
          snippet: {
            title: "test 3",
            description: "des",
          },
          // I don't want to spam my subscribers
          // status: {
          //   privacyStatus: "private",
          // },
        },
        // This is for the callback function
        part: "snippet",

        // Create the readable stream to upload the video
        media: {
          body: fs.createReadStream("uploads/p.mp4"),
        },
      },
      (err, data) => {
        if (err) throw err;
        console.log(data);
        console.log("Done.");
        // fs.unlinkSync("uploads/p.mp4");
      }
    );
  } catch (e) {
    console.log("errr " + e);
  }
};

module.exports = { getAuth, getAuthUrl, getNewToken };
