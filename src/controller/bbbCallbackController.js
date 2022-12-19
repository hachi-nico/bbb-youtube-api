const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const {
  getAuthWithCallback,
} = require("../controller/youtubeUploadController");
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
  const secret = await getSecret();
  if (!secret) {
    logger("[TST] Tidak ada secret yang tersedia");
    return res.status(200).json(resSuccess("Tidak ada secret yang tersedia"));
  }

  let bbbCallbackBody = "";
  const { signed_parameters } = req.body;
  if (signed_parameters) {
    bbbCallbackBody = jwt.decode(signed_parameters);
  } else {
    logger("[GAC] Gagal saat melakukan action callback");
    return res
      .status(500)
      .json(resError("Gagal saat melakukan action callback"));
  }

  bbbCallbackBody = {
    meeting_id: "room-Sidang-PA-7649377",
    record_id: `${Math.floor(Math.random() * 1001)} ${new Date()}`,
  };

  const isUploading = await getCurrentUploading();

  const titleFormat = `${Math.floor(Math.random() * 1001)} ${
    bbbCallbackBody.meeting_id
  } ${dayjs().format(insertDateTimeFormat)}`;
  const insertLaporan = await createLaporan(
    titleFormat,
    bbbCallbackBody.record_id,
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
          addtionalData: {
            title: titleFormat,
            desc: bbbCallbackBody.record_id,
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
