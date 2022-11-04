const jwt = require("jsonwebtoken");

const listenRecordingReady = (req, res) => {
  const callbackBody = jwt.decode(req.body.signed_parameters);
  const recordingDirectory = `/var/bigbluebutton/published/presentation/${callbackBody.record_id}/video/webcams.webm`;

  console.log("webhook recording ready called");
  return res.json({ msg: "yay" });
};

module.exports = { listenRecordingReady };
