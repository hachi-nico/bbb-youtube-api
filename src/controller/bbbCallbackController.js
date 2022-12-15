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

const listenRecordingReady = async (req, res) => {
  let bbbCallbackBody = "";
  if (req.body.signed_parameters) {
    bbbCallbackBody = jwt.decode(req.body.signed_parameters);
  } else {
    logger("[GAC] Gagal saat melakukan action callback");
    return res
      .status(500)
      .json(resError("Gagal saat melakukan action callback"));
  }

  bbbCallbackBody = {
    meeting_id: "random-7649377",
    record_id: `${Math.floor(Math.random() * 1001)} ${new Date()}`,
  };

  const isUploading = await getCurrentUploading();

  const insertLaporan = await createLaporan(
    `${bbbCallbackBody.meeting_id} ${dayjs().format(insertDateTimeFormat)}`,
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
            meeting_id: `${bbbCallbackBody.meeting_id} ${dayjs().format(
              insertDateTimeFormat
            )}`,
            record_id: bbbCallbackBody.record_id,
          },
          secretFile: ".client-secret-vegan-market.json",
          callbackType: "youtubeUpload",
        },
      },
      res
    );
  } catch (e) {
    logger("[GAU] Gagal saat melakukan action upload");
    return res.status(500).json(resError("Gagal saat melakukan action upload"));
  }
};

module.exports = { listenRecordingReady };
