const { createLaporan } = require("../model/laporan_upload");
const { listenRecordingReady } = require("./bbbCallbackController");
const { resError, insertDateTimeFormat } = require("./globalFunction");

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

    await createLaporan(
      manualTitle ?? "Tanpa Judul",
      manualDescription ?? "Tanpa Deskripsi",
      dayjs().format(insertDateTimeFormat),
      "",
      2,
      0
    );
  } catch (e) {
    return res.status(500).json({ e, message: "Error saat upload ke server" });
  }
};

module.exports = { upload };
