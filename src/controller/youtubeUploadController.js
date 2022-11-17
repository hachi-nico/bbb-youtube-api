const fs = require("fs");
const cwd = require("path").dirname(require.main.filename);
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const {
  SCOPES,
  TOKEN_PATH,
  storeToken,
  resError,
  resSuccess,
} = require("./globalFunction");

const getAuthWithCallback = (req, res) => {
  const { callbackType, secretFile, addtionalData = {} } = req.body;

  if (!secretFile)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  try {
    const content = fs.readFileSync(cwd + "/" + secretFile);

    if (callbackType == "getChannel") {
      authorize(secretFile, JSON.parse(content), getChannel, res);
    } else if (callbackType == "pollVideoStatus") {
      authorize(
        secretFile,
        JSON.parse(content),
        pollVideoStatus,
        res,
        addtionalData
      );
    } else if (callbackType == "youtubeUpload") {
      authorize(
        secretFile,
        JSON.parse(content),
        youtubeUpload,
        res,
        addtionalData
      );
    } else {
      return res.status(500).json(resError("Tipe callback tidak valid"));
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
        storeToken(token, secretFile);
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

const authorize = (secretFile, credentials, callback, res, addtionalData) => {
  const { client_secret, client_id } = credentials.web;
  const redirectUrl = credentials.web.redirect_uris[0];

  fs.readFile(TOKEN_PATH + secretFile, function (err, token) {
    if (err) {
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
      callback(oauth2Client, res, addtionalData);
    }
  });
};

const pollVideoStatus = (auth, res, addtionalData) => {
  const service = google.youtube("v3");
  service.search.list(
    {
      q: addtionalData.searchQuery,
      auth,
      maxResults: 1,
    },
    function (err, response) {
      if (err) return res.status(500).json(resError("gagal search video"));

      return res.json({ response });
    }
  );

  // let poller = "";
  // let stopPoller = false;
  // poller = setInterval(async () => {
  //   if (result.data.antrian.status == 1) stopPoller = true;

  //   if (stopPoller) {
  //     clearInterval(poller);
  //     return res.status(204).send();
  //   }
  // }, 300000);
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
      if (err)
        return res.json(resError("gagal get channel", err.response.data));

      const channels = response.data.items;
      return res.json(
        resSuccess("berhasil get channel " + channels[0].snippet.title)
      );
    }
  );
};

const youtubeUpload = (auth, res, addtionalData = {}) => {
  try {
    const youtube = google.youtube({ version: "v3", auth });
    const recordingDirectory = `/var/bigbluebutton/published/presentation/${addtionalData.bbbCallbackBody.record_id}/video/webcams.webm`;
    youtube.videos.insert(
      {
        resource: {
          snippet: {
            title: `Recording meeting ${addtionalData.meeting_id}`,
            description: `recording bigbluebutton dengan meeting_id ${addtionalData.meeting_id}`,
          },
        },
        part: "snippet",
        media: {
          body: fs.createReadStream(recordingDirectory),
        },
      },
      (err, data) => {
        if (err) return res.status(500).json({ message: "gagal upload", err });
        return res.status(200).json({ message: "berhasil upload" });
      }
    );
  } catch (e) {
    return res.status(500).json({ message: "gagal upload", err });
  }
};

module.exports = {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
  pollVideoStatus,
};
