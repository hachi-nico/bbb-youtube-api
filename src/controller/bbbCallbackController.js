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
} = require("../controller/globalFunction");

const listenRecordingReady = async (req, res) => {
  let bbbCallbackBody = "";
  if (req.body.signed_parameters)
    bbbCallbackBody = jwt.decode(req.body.signed_parameters);

  bbbCallbackBody = {
    meeting_id: "random-7649377",
    record_id: "15b4cf5c8edf2d32bbd4007dc6b82c83a8839345-1667438466508",
  };

  const insertLaporan = await createLaporan(
    `${bbbCallbackBody.meeting_id} ${dayjs().format(insertDateTimeFormat)}`,
    bbbCallbackBody.record_id,
    "",
    dayjs().format(insertDateTimeFormat),
    "",
    isUploading ? 4 : 2,
    0
  );

  if (!insertLaporan)
    return res
      .status(500)
      .json(resError("Gagal saat melakukan insert laporan"));

  const isUploading = await getCurrentUploading();

  if (isUploading)
    return res
      .status(200)
      .json(resSuccess("Ada video yang sedang di proses upload"));

  try {
    return await getAuthWithCallback(
      {
        body: {
          addtionalData: bbbCallbackBody,
          secretFile: ".client-secret-vegan-market.json",
          callbackType: "youtubeUpload",
        },
      },
      res
    );
  } catch (e) {
    return res.status(500).json(resError("Gagal saat melakukan action upload"));
  }
};

module.exports = { listenRecordingReady };
