const listenRecordingReady = (req, res) => {
  console.log("webhook recording ready called");

  return res.json({ msg: "yay" });
};

module.exports = { listenRecordingReady };
