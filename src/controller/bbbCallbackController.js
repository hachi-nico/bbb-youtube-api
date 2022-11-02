const jwt = require("jsonwebtoken");

const listenRecordingReady = (req, res) => {
  console.log(jwt.decode(req.body.signed_parameters));
  console.log("webhook recording ready called");

  return res.json({ msg: "yay" });
};

module.exports = { listenRecordingReady };
