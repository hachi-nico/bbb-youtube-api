const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { getAuthWithCallback } = require("../controller/youtubeController");
const {
  createLaporan,
  getCurrentUploading,
} = require("../model/laporan_upload");
const {
  resError,
  resSuccess,
  insertDateTimeFormat,
  logger,
} = require("../controller/globalFunction");
const { getSecret } = require("../model/google_auth_secret");

const listenRecordingReady = async (req, res) => {
  let bbbCallbackBody = "";
  const { signed_parameters, manualTitle, manualDescription, manualFilename } =
    req.body;

  if (signed_parameters) {
    bbbCallbackBody = jwt.decode(signed_parameters);
  } else {
    if (!manualFilename) {
      logger("[GAC] Gagal saat melakukan action callback");
      return res
        .status(500)
        .json(resError("Gagal saat melakukan action callback"));
    }
  }

  bbbCallbackBody = {
    meeting_id: "room-Sidang-PA-7649377",
    record_id: `${Math.floor(Math.random() * 1001)} ${new Date()}`,
  };

  const secret = await getSecret();
  if (!secret) {
    await createLaporan(
      manualTitle ?? titleFormat,
      manualDescription ?? bbbCallbackBody.record_id,
      dayjs().format(insertDateTimeFormat),
      "",
      5,
      0
    );
    logger("[TST] Tidak ada secret yang tersedia");
    return res.status(200).json(resSuccess("Tidak ada secret yang tersedia"));
  }

  const isUploading = await getCurrentUploading();

  const titleFormat = `${Math.floor(Math.random() * 1001)} ${
    bbbCallbackBody.meeting_id
  } ${dayjs().format(insertDateTimeFormat)}`;

  const insertLaporan = await createLaporan(
    manualTitle ?? titleFormat,
    manualDescription ?? bbbCallbackBody.record_id,
    dayjs().format(insertDateTimeFormat),
    "",
    isUploading ? 4 : 2,
    0
  );

  if (!insertLaporan) {
    logger("[GIL] Gagal saat melakukan insert laporan");
    return res
      .status(500)
      .json(resError("Gagal saat melakukan insert laporan"));
  }

  if (isUploading) {
    return res
      .status(200)
      .json(resSuccess("Ada video yang sedang di proses upload"));
  }

  try {
    return await getAuthWithCallback(
      {
        body: {
          additionalData: {
            title: manualTitle ?? titleFormat,
            desc: manualDescription ?? bbbCallbackBody.record_id,
            filename: manualFilename ?? "",
          },
          secretFile: secret.secret,
          callbackType: "youtubeUpload",
        },
      },
      res
    );
  } catch (e) {
    logger("[GAU] Gagal saat melakukan action upload");
    return res
      .status(500)
      .json(resError("Gagal saat melakukan action upload", { e }));
  }
};

module.exports = { listenRecordingReady };
