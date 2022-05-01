const upload = (req, res) => {
  try {
    return res.status(200).json({
      message: "Berhasil upload ke server",
      path: req.file.path,
      req: req.body,
    });
  } catch (e) {
    return res.status(500).json({ message: "Error saat upload ke server" + e });
  }
};

module.exports = { upload };
