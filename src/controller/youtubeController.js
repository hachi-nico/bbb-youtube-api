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
  sendNotification,
} = require("./globalFunction");
const {
  getNextAntrian,
  updateStatusLaporan,
} = require("../model/laporan_upload");
const { getSecret, markExpSecret } = require("../model/google_auth_secret");

const getAuthWithCallback = async (req, res) => {
  const { callbackType, additionalData = {} } = req.body;

  // secret untuk list dan update
  const whitelistCallback = ["listVideo", "updateVideo"].includes(callbackType);

  // secret untuk upload
  let { secret: secretFile } = await getSecret();

  if (whitelistCallback) secretFile = "client-secret-custom-bike.json";

  if (!secretFile) {
    logger("[TST] Tidak ada secret yang tersedia");
    return res.status(200).json(resSuccess("Tidak ada secret yang tersedia"));
  }

  if (!secretFile)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  try {
    const content = fs.readFileSync(cwd + "/" + secretFile);
    const credentials = JSON.parse(content);

    if (callbackType == "getChannel") {
      authorize({ secretFile, credentials, callback: getChannel, res });
    } else if (callbackType == "youtubeUpload") {
      authorize({
        secretFile,
        credentials,
        callback: youtubeUpload,
        res,
        additionalData,
      });
    } else if (callbackType == "listVideo") {
      authorize({
        secretFile,
        req,
        res,
        credentials,
        callback: listVideoChannel,
      });
    } else if (callbackType == "updateVideo") {
      authorize({
        secretFile,
        req,
        res,
        credentials,
        callback: updateVideo,
      });
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
    fs.readFile(cwd + "/" + secretFile, (e, content) => {
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
    fs.readFile(cwd + "/" + secretFile, (e, content) => {
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

const authorize = ({
  secretFile,
  credentials,
  callback,
  req,
  res,
  additionalData,
}) => {
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
      callback({ auth: oauth2Client, req, res, additionalData });
    }
  });
};

const getChannel = ({ auth, res }) => {
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
      return res.json(resSuccess("berhasil get channel "));
    }
  );
};

let structuredData = [];
const listVideoChannel = ({ auth, res, req, nextPageTokenReq }) => {
  const { offset, limit, search } = req.body;
  const cwd = require("path").dirname(require.main.filename);
  const cachePath = cwd + "/.cache/channel-list.json";

  const handleError = () => {
    res.status(500).json(resSuccess("Gagal saat mengambil list video"));
  };

  const handleDataFilter = (data) => {
    let filteredData = data;
    if (offset) filteredData = filteredData.slice(offset);
    if (limit) filteredData = filteredData.slice(0, limit);
    if (search)
      filteredData = filteredData.filter((item) => item.judul.includes(search));

    return filteredData;
  };

  const cacheExist = fs.existsSync(cachePath);
  if (cacheExist) {
    try {
      const data = fs.readFileSync(cachePath);
      const parsedData = JSON.parse(data.toString());
      const resData = handleDataFilter(parsedData.data);

      return res
        .status(200)
        .json(resSuccess("", { count: parsedData.count, data: resData }));
    } catch (e) {
      handleError();
    }
  }

  const service = google.youtube("v3");

  service.playlistItems.list(
    {
      auth,
      part: "snippet",
      playlistId: process.env.CHANNEL_UPLOAD_ID,
      maxResults: 50,
      pageToken: nextPageTokenReq ?? "",
    },
    (err, response) => {
      if (!response || err) return handleError();

      const buildData =
        response.data?.items?.length > 0
          ? response.data.items.map((item) => ({
              id: item.snippet?.resourceId?.videoId,
              tgl: item?.snippet?.publishedAt,
              judul: item?.snippet?.title,
              deskripsi: item?.snippet?.description,
            }))
          : [];

      structuredData.push(buildData);
      const count = response.data?.pageInfo?.totalResults;
      const nextPageToken = response.data?.nextPageToken;

      if (nextPageToken) {
        listVideoChannel({ auth, res, nextPageTokenReq: nextPageToken });
      } else {
        const resData = structuredData[0];
        structuredData = [];

        const writeFile = fs.createWriteStream(cachePath);

        writeFile.write(JSON.stringify({ count, data: resData }));
        writeFile.on("error", () =>
          res.status(500).json(resError("Gagal saat write file json"))
        );
        writeFile.on("finish", () => {
          const filteredData = handleDataFilter(resData);
          res.status(200).json(resSuccess("", { count, data: filteredData }));
        });
        writeFile.end();
      }
    }
  );
};

const youtubeUpload = async ({ auth, res, req, additionalData = {} }) => {
  const youtube = google.youtube({ version: "v3", auth });
  let recordingDirectory = "";
  // const recordingDirectory = `/var/bigbluebutton/published/presentation/${additionalData.desc}/video/webcams.webm`;
  recordingDirectory = cwd + "/uploads/p.mp4";

  if (additionalData.filename) {
    recordingDirectory = additionalData.filename;
  }

  if (!recordingDirectory) {
    logger("[FTD] File tidak ditemukan");
    return res.status(200).json(resSuccess("File tidak ditemukan"));
  }

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
      const cachePath = cwd + "/.cache/channel-list.json";
      const cacheExist = fs.existsSync(cachePath);

      if (cacheExist) fs.unlink(cachePath, () => {});

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
                additionalData: {
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

      if (req?.app?.get("clientSub")) {
        sendNotification(
          req.app.get("clientSub"),
          "Video dengan judul " +
            additionalData.judul +
            " telah berhasil di upload ke youtube"
        );
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

const updateVideo = ({ auth, req, res }) => {
  const { id, judul, deskripsi } = req.body;
  const youtube = google.youtube({ version: "v3", auth });

  if (!id)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  youtube.videos.update(
    {
      requestBody: {
        id,
        snippet: { categoryId: 27, title: judul, description: deskripsi },
      },
      part: "snippet",
      auth,
    },
    (err) => {
      if (err)
        return res
          .status(500)
          .json(resError("Gagal saat update video", { err }));

      const cachePath = cwd + "/.cache/channel-list.json";
      const cacheExist = fs.existsSync(cachePath);

      if (cacheExist) fs.unlink(cachePath, () => {});
      return res.status(200).json(resSuccess(""));
    }
  );
};

module.exports = {
  getAuthWithCallback,
  getAuthUrl,
  getNewToken,
};
