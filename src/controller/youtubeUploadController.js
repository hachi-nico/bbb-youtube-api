const fs = require("fs");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const { SCOPES, TOKEN_PATH, storeToken } = require("./globalFunction");

// controller
const getAuthWithCallback = (req, res) => {
  const { callbackTypes, secretFile } = req.body;
  try {
    // Load credentials file lokal
    const content = fs.readFileSync(secretFile);

    if (callbackTypes == "getChannel") {
      authorize(JSON.parse(content), getChannel, res);
    } else if (callbackTypes == "youtubeUpload") {
      authorize(JSON.parse(content), youtubeUpload, res);
    }
  } catch (e) {
    return res.status(500).json({
      e,
      message: "Gagal saat load client secret file",
    });
  }
};

const getAuthUrl = (req, res) => {
  const { secretFile } = req.query;

  try {
    fs.readFile(secretFile, (e, content) => {
      if (e) {
        return res.status(500).json({
          e,
          message: "Gagal saat load client secret file",
        });
      }

      const secret = JSON.parse(content);
      const oauth2Client = new OAuth2(
        secret.web.client_id,
        secret.web.client_secret,
        secret.web.redirect_uris[0]
      );

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      return res.json({ authUrl });
    });
  } catch (e) {
    return res.status(500).json({
      e,
      message: "Gagal saat load client secret file",
    });
  }
};

const getNewToken = (req, res) => {
  const { secretFile, code } = req.body;

  try {
    fs.readFile(secretFile, (e, content) => {
      if (e) {
        return res.status(500).json({
          e,
          message: "Gagal saat load client secret file",
        });
      }

      const secret = JSON.parse(content);
      const oauth2Client = new OAuth2(
        secret.web.client_id,
        secret.web.client_secret,
        secret.web.redirect_uris[0]
      );
      oauth2Client.getToken(code, (e, token) => {
        if (e) {
          return res.status(500).json({
            e,
            message: "Gagal saat mendapatkan token dari authurl",
          });
        }
        oauth2Client.setCredentials(token);
        storeToken(token);
        return res
          .status(200)
          .json({ message: "berhasil mendapatkan token baru" });
      });
    });
  } catch (e) {
    return res.status(500).json({
      e,
      message: "Gagal saat load client secret file",
    });
  }
};

// depedency function
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
      oauth2Client.setCredentials(JSON.parse(token));
      callback(oauth2Client, res);
    }
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
        return res.status(500).json({
          err,
          message: "gagal get channel",
        });
      }
      const channels = response.data.items;
      return res.status(200).json({
        auth,
        message: "berhasil get channel " + channels[0].snippet.title,
      });
    }
  );
};

const youtubeUpload = (auth, res, fileAttributes = {}) => {
  try {
    // const { path } = fileAttributes;
    const youtube = google.youtube({ version: "v3", auth });
    console.log(youtube);
    youtube.videos.insert(
      {
        resource: {
          snippet: {
            title: fileAttributes.title,
            description: fileAttributes.description,
          },
        },
        // This is for the callback function
        part: "snippet",

        // Create the readable stream to upload the video
        media: {
          body: fs.createReadStream("uploads/p.mp4"),
        },
      },
      (err, data) => {
        if (err) {
          return res.status(500).json({ message: "gagal upload", err });
        }
        // fs.unlinkSync("uploads/p.mp4");
        return res.status(200).json({ message: "berhasil upload" });
      }
    );
  } catch (e) {
    return res.status(500).json({ message: "gagal upload", err });
  }
};

module.exports = { getAuthWithCallback, getAuthUrl, getNewToken };
