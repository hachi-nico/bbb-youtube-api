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
  logger,
} = require("./globalFunction");
const {
  getNextAntrian,
  updateStatusLaporan,
} = require("../model/laporan_upload");
const { getSecret, markExpSecret } = require("../model/google_auth_secret");

const getAuthWithCallback = (req, res) => {
  const { callbackType, secretFile, addtionalData = {} } = req.body;

  if (!secretFile)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  try {
    const content = fs.readFileSync(cwd + "/" + secretFile);

    if (callbackType == "getChannel") {
      authorize(secretFile, JSON.parse(content), getChannel, res);
    } else if (callbackType == "youtubeUpload") {
      authorize(
        secretFile,
        JSON.parse(content),
        youtubeUpload,
        res,
        addtionalData
      );
    } else {
      console.log("Tipe callback tidak valid");
      return res.status(500).json(resError("Tipe callback tidak valid"));
    }
  } catch (e) {
    console.log("Gagal saat load client secret file");
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

const youtubeUpload = async (auth, res, additionalData = {}) => {
  const youtube = google.youtube({ version: "v3", auth });
  // const recordingDirectory = `/var/bigbluebutton/published/presentation/${additionalData.desc}/video/webcams.webm`;
  const recordingDirectory = cwd + "/uploads/p.mp4";

  youtube.videos.insert(
    {
      resource: {
        snippet: {
          title: additionalData.title,
          description: additionalData.desc,
        },
      },
      part: "snippet",
      media: {
        body: fs.createReadStream(recordingDirectory),
      },
    },
    async (err, data) => {
      const isNextAvailable = await getNextAntrian();
      if (err) {
        const isQuotaExceed =
          err?.response?.data?.error?.errors[0].reason == "quotaExceeded"
            ? true
            : false;

        if (isQuotaExceed) {
          logger("[MSB] Mengambil Secret Berikutnya");
          const updated = await markExpSecret();

          if (!updated) {
            logger("[GUSS] Gagal saat mengubah status secret");
            return res
              .status(500)
              .json({ message: "Gagal saat mengubah status secret", err });
          }

          const secret = await getSecret();
          if (!secret) {
            logger("[TST-2] Tidak ada secret yang tersedia");
            return res
              .status(200)
              .json(resSuccess("Tidak ada secret yang tersedia"));
          }

          getAuthWithCallback(
            {
              body: {
                addtionalData: {
                  title: isNextAvailable.judul,
                  desc: isNextAvailable.deskripsi,
                },
                secretFile: secret.secret,
                callbackType: "youtubeUpload",
              },
            },
            res
          );
        } else {
          logger("[GAU-2] Gagal saat upload");
          return res.status(500).json({ message: "Gagal saat upload", err });
        }
      }

      const updated = await updateStatusLaporan(1, additionalData.desc);
      if (!updated) {
        logger("[GSB] Gagal saat update status menjadi berhasil");
        return res
          .status(500)
          .json(resError("Gagal saat update status menjadi berhasil"));
      }

      if (isNextAvailable) {
        await youtubeUpload(auth, res, {
          title: isNextAvailable.judul,
          desc: isNextAvailable.deskripsi,
        });
      } else {
        return res.json({});
      }
    }
  );
};

module.exports = {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
};
