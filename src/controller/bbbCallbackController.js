const jwt = require("jsonwebtoken");
const {
  getAuthWithCallback,
} = require("../controller/youtubeUploadController");
const { ressError, resSuccess } = require("../controller/globalFunction");

const listenRecordingReady = async (req, res) => {
  let bbbCallbackBody = "";
  if (req.body.signed_parameters)
    bbbCallbackBody = jwt.decode(req.body.signed_parameters);

  const recordingDirectory = `/var/bigbluebutton/published/presentation/${bbbCallbackBody.record_id}/video/webcams.webm`;

  try {
    return await getAuthWithCallback(
      {
        body: {
          bbbCallbackBody,
          secretFile: ".client-secret-vegan-market.json",
          callbackType: "getChannel",
        },
      },
      res
    );
  } catch (e) {
    return res
      .status(500)
      .json(ressError("Gagal saat melakukan action callback"));
  }
};

module.exports = { listenRecordingReady };
