const { listenRecordingReady } = require("./bbbCallbackController");
const { resError } = require("./globalFunction");

const upload = async (req, res) => {
  const { manualTitle, manualDescription } = req.body;
  const manualFilename = req?.files?.file?.file;

  if (!manualFilename) {
    return res.status(500).json(resError("File tidak valid"));
  }

  try {
    await listenRecordingReady(
      {
        body: {
          manualTitle: manualTitle ?? "Tanpa Judul",
          manualDescription: manualDescription ?? "Tanpa Deskripsi",
          manualFilename,
        },
      },
      res
    );
  } catch (e) {
    return res.status(500).json({ e, message: "Error saat upload ke server" });
  }
};

module.exports = { upload };
